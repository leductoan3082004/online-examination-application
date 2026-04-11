package com.examapp.service;

import com.examapp.dto.student.*;
import com.examapp.entity.*;
import com.examapp.enums.Role;
import com.examapp.exception.ConflictException;
import com.examapp.exception.ResourceNotFoundException;
import com.examapp.repository.*;
import com.examapp.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock private ExamRepository examRepository;
    @Mock private UserRepository userRepository;
    @Mock private QuestionRepository questionRepository;
    @Mock private AnswerOptionRepository answerOptionRepository;
    @Mock private TestAttemptRepository testAttemptRepository;
    @Mock private StudentAnswerRepository studentAnswerRepository;
    @Mock private JwtUtil jwtUtil;
    @InjectMocks private StudentService studentService;

    private User createStudent() {
        User s = new User("Alice", "alice@student.exam", "N/A", Role.STUDENT);
        s.setId(5L);
        return s;
    }

    private Exam createExam() {
        User teacher = new User("Teacher", "t@t.com", "hash", Role.TEACHER);
        teacher.setId(1L);
        Exam e = new Exam();
        e.setId(10L);
        e.setTitle("Math Test");
        e.setDescription("A math test");
        e.setPasscode("CODE");
        e.setTeacher(teacher);
        return e;
    }

    private Question createQuestion(Exam exam, Long id) {
        Question q = new Question();
        q.setId(id);
        q.setExam(exam);
        q.setQuestionText("Q" + id);
        q.setPoints(10);
        q.setDisplayOrder(id.intValue());

        AnswerOption correct = new AnswerOption();
        correct.setId(id * 10);
        correct.setOptionText("Correct");
        correct.setIsCorrect(true);
        correct.setDisplayOrder(1);
        correct.setQuestion(q);

        AnswerOption wrong = new AnswerOption();
        wrong.setId(id * 10 + 1);
        wrong.setOptionText("Wrong");
        wrong.setIsCorrect(false);
        wrong.setDisplayOrder(2);
        wrong.setQuestion(q);

        q.setOptions(new ArrayList<>(List.of(correct, wrong)));
        return q;
    }

    @Test
    void accessTest_success_newStudent() {
        Exam exam = createExam();
        StudentAccessRequest request = new StudentAccessRequest("CODE", "Alice");

        when(examRepository.findByPasscode("CODE")).thenReturn(Optional.of(exam));
        when(userRepository.findByEmail("alice@student.exam")).thenReturn(Optional.empty());

        User newStudent = createStudent();
        when(userRepository.save(any(User.class))).thenReturn(newStudent);
        when(jwtUtil.generateStudentToken(5L, 10L, "STUDENT")).thenReturn("student-jwt");

        StudentAccessResponse response = studentService.accessTest(request);

        assertEquals("student-jwt", response.token());
        assertEquals(10L, response.testId());
        assertEquals("Math Test", response.testTitle());
        assertEquals(5L, response.studentId());
    }

    @Test
    void accessTest_invalidPasscode_throwsException() {
        when(examRepository.findByPasscode("BAD")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> studentService.accessTest(new StudentAccessRequest("BAD", "Alice")));
    }

    @Test
    void getTestQuestions_returnsQuestionsWithoutCorrectFlag() {
        Exam exam = createExam();
        Question q = createQuestion(exam, 1L);

        when(examRepository.findById(10L)).thenReturn(Optional.of(exam));
        when(questionRepository.findByExamIdOrderByDisplayOrderAsc(10L)).thenReturn(List.of(q));

        StudentTestResponse response = studentService.getTestQuestions(10L);

        assertEquals("Math Test", response.testTitle());
        assertEquals(1, response.totalQuestions());
        // Student options should not include isCorrect - verified by DTO structure (no isCorrect field)
        assertEquals(2, response.questions().get(0).options().size());
    }

    @Test
    void submitTest_success() {
        Exam exam = createExam();
        User student = createStudent();
        Question q = createQuestion(exam, 1L);
        AnswerOption correctOpt = q.getOptions().get(0); // isCorrect = true

        when(testAttemptRepository.existsByExamIdAndStudentId(10L, 5L)).thenReturn(false);
        when(examRepository.findById(10L)).thenReturn(Optional.of(exam));
        when(userRepository.findById(5L)).thenReturn(Optional.of(student));
        when(questionRepository.findByExamIdOrderByDisplayOrderAsc(10L)).thenReturn(List.of(q));
        when(answerOptionRepository.findById(correctOpt.getId())).thenReturn(Optional.of(correctOpt));

        TestAttempt savedAttempt = new TestAttempt();
        savedAttempt.setId(1L);
        savedAttempt.setScore(10);
        savedAttempt.setMaxScore(10);
        savedAttempt.setSubmittedAt(Instant.now());
        when(testAttemptRepository.save(any(TestAttempt.class))).thenReturn(savedAttempt);

        SubmitTestRequest request = new SubmitTestRequest(
                List.of(new SubmitTestRequest.AnswerDto(1L, correctOpt.getId()))
        );

        SubmitResultResponse response = studentService.submitTest(5L, 10L, request);

        assertEquals(1L, response.attemptId());
        assertEquals(10, response.score());
        assertEquals(10, response.maxScore());
        assertEquals(100.0, response.percentage());
    }

    @Test
    void submitTest_alreadySubmitted_throwsConflict() {
        when(testAttemptRepository.existsByExamIdAndStudentId(10L, 5L)).thenReturn(true);

        assertThrows(ConflictException.class,
                () -> studentService.submitTest(5L, 10L, new SubmitTestRequest(List.of())));
    }

    @Test
    void getAttemptResult_success() {
        Exam exam = createExam();
        User student = createStudent();
        Question q = createQuestion(exam, 1L);
        AnswerOption selected = q.getOptions().get(0);

        TestAttempt attempt = new TestAttempt();
        attempt.setId(1L);
        attempt.setExam(exam);
        attempt.setStudent(student);
        attempt.setScore(10);
        attempt.setMaxScore(10);
        attempt.setSubmittedAt(Instant.now());

        StudentAnswer sa = new StudentAnswer();
        sa.setQuestion(q);
        sa.setSelectedOption(selected);
        sa.setAttempt(attempt);

        when(testAttemptRepository.findById(1L)).thenReturn(Optional.of(attempt));
        when(studentAnswerRepository.findByAttemptId(1L)).thenReturn(List.of(sa));

        AttemptResultResponse response = studentService.getAttemptResult(5L, 1L);

        assertEquals(1L, response.attemptId());
        assertEquals("Math Test", response.testTitle());
        assertEquals(1, response.questions().size());
        assertTrue(response.questions().get(0).isCorrect());
    }

    @Test
    void getAttemptResult_wrongStudent_throwsException() {
        User student = createStudent();
        TestAttempt attempt = new TestAttempt();
        attempt.setId(1L);
        attempt.setStudent(student);

        when(testAttemptRepository.findById(1L)).thenReturn(Optional.of(attempt));

        assertThrows(ResourceNotFoundException.class,
                () -> studentService.getAttemptResult(999L, 1L));
    }

    @Test
    void getPastAttempts_returnsList() {
        Exam exam = createExam();
        User student = createStudent();

        TestAttempt attempt = new TestAttempt();
        attempt.setId(1L);
        attempt.setExam(exam);
        attempt.setStudent(student);
        attempt.setScore(80);
        attempt.setMaxScore(100);
        attempt.setSubmittedAt(Instant.now());

        when(testAttemptRepository.findByStudentIdOrderBySubmittedAtDesc(5L)).thenReturn(List.of(attempt));

        List<PastAttemptResponse> results = studentService.getPastAttempts(5L);

        assertEquals(1, results.size());
        assertEquals("Math Test", results.get(0).testTitle());
        assertEquals(80, results.get(0).score());
    }
}
