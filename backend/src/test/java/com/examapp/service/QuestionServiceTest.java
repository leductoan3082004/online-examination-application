package com.examapp.service;

import com.examapp.dto.MessageResponse;
import com.examapp.dto.question.*;
import com.examapp.entity.*;
import com.examapp.enums.Role;
import com.examapp.exception.BadRequestException;
import com.examapp.exception.ResourceNotFoundException;
import com.examapp.repository.QuestionRepository;
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
class QuestionServiceTest {

    @Mock private QuestionRepository questionRepository;
    @Mock private ExamService examService;
    @InjectMocks private QuestionService questionService;

    private Exam createExam() {
        User teacher = new User("Teacher", "t@t.com", "hash", Role.TEACHER);
        teacher.setId(1L);
        Exam exam = new Exam();
        exam.setId(1L);
        exam.setTeacher(teacher);
        return exam;
    }

    private QuestionRequest createValidRequest() {
        return new QuestionRequest("What is 2+2?", 10, 1, List.of(
                new QuestionRequest.OptionRequest("3", false, 1),
                new QuestionRequest.OptionRequest("4", true, 2)
        ));
    }

    private Question createQuestion(Exam exam) {
        Question q = new Question();
        q.setId(1L);
        q.setExam(exam);
        q.setQuestionText("What is 2+2?");
        q.setPoints(10);
        q.setDisplayOrder(1);
        q.setCreatedAt(Instant.now());

        AnswerOption opt1 = new AnswerOption();
        opt1.setId(1L);
        opt1.setOptionText("3");
        opt1.setIsCorrect(false);
        opt1.setDisplayOrder(1);
        opt1.setQuestion(q);

        AnswerOption opt2 = new AnswerOption();
        opt2.setId(2L);
        opt2.setOptionText("4");
        opt2.setIsCorrect(true);
        opt2.setDisplayOrder(2);
        opt2.setQuestion(q);

        q.setOptions(new ArrayList<>(List.of(opt1, opt2)));
        return q;
    }

    @Test
    void addQuestion_success() {
        Exam exam = createExam();
        QuestionRequest request = createValidRequest();
        when(examService.getOwnedExam(1L, 1L)).thenReturn(exam);

        Question saved = createQuestion(exam);
        when(questionRepository.save(any(Question.class))).thenReturn(saved);

        QuestionResponse response = questionService.addQuestion(1L, 1L, request);

        assertEquals("What is 2+2?", response.questionText());
        assertEquals(10, response.points());
        assertEquals(2, response.options().size());
    }

    @Test
    void addQuestion_noCorrectAnswer_throwsException() {
        Exam exam = createExam();
        when(examService.getOwnedExam(1L, 1L)).thenReturn(exam);

        QuestionRequest request = new QuestionRequest("Q?", 10, 1, List.of(
                new QuestionRequest.OptionRequest("A", false, 1),
                new QuestionRequest.OptionRequest("B", false, 2)
        ));

        assertThrows(BadRequestException.class, () -> questionService.addQuestion(1L, 1L, request));
    }

    @Test
    void addQuestion_multipleCorrectAnswers_throwsException() {
        Exam exam = createExam();
        when(examService.getOwnedExam(1L, 1L)).thenReturn(exam);

        QuestionRequest request = new QuestionRequest("Q?", 10, 1, List.of(
                new QuestionRequest.OptionRequest("A", true, 1),
                new QuestionRequest.OptionRequest("B", true, 2)
        ));

        assertThrows(BadRequestException.class, () -> questionService.addQuestion(1L, 1L, request));
    }

    @Test
    void getQuestions_returnsList() {
        Exam exam = createExam();
        when(examService.getOwnedExam(1L, 1L)).thenReturn(exam);
        when(questionRepository.findByExamIdOrderByDisplayOrderAsc(1L))
                .thenReturn(List.of(createQuestion(exam)));

        List<QuestionResponse> result = questionService.getQuestions(1L, 1L);

        assertEquals(1, result.size());
        assertEquals("What is 2+2?", result.get(0).questionText());
    }

    @Test
    void updateQuestion_success() {
        Exam exam = createExam();
        when(examService.getOwnedExam(1L, 1L)).thenReturn(exam);

        Question existing = createQuestion(exam);
        when(questionRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(questionRepository.save(any(Question.class))).thenReturn(existing);

        QuestionRequest request = createValidRequest();
        QuestionResponse response = questionService.updateQuestion(1L, 1L, 1L, request);

        assertNotNull(response);
        verify(questionRepository).save(any(Question.class));
    }

    @Test
    void deleteQuestion_success() {
        Exam exam = createExam();
        when(examService.getOwnedExam(1L, 1L)).thenReturn(exam);

        Question question = createQuestion(exam);
        when(questionRepository.findById(1L)).thenReturn(Optional.of(question));

        questionService.deleteQuestion(1L, 1L, 1L);

        verify(questionRepository).delete(question);
    }

    @Test
    void deleteQuestion_notFound_throwsException() {
        Exam exam = createExam();
        when(examService.getOwnedExam(1L, 1L)).thenReturn(exam);
        when(questionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> questionService.deleteQuestion(1L, 1L, 99L));
    }

    @Test
    void reorderQuestions_success() {
        Exam exam = createExam();
        when(examService.getOwnedExam(1L, 1L)).thenReturn(exam);

        Question q1 = createQuestion(exam);
        q1.setId(1L);
        Question q2 = createQuestion(exam);
        q2.setId(2L);

        when(questionRepository.findById(2L)).thenReturn(Optional.of(q2));
        when(questionRepository.findById(1L)).thenReturn(Optional.of(q1));
        when(questionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        MessageResponse response = questionService.reorderQuestions(1L, 1L, List.of(2L, 1L));

        assertEquals("Questions reordered", response.message());
        assertEquals(1, q2.getDisplayOrder());
        assertEquals(2, q1.getDisplayOrder());
    }
}
