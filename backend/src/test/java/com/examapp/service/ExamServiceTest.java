package com.examapp.service;

import com.examapp.dto.test.*;
import com.examapp.entity.Exam;
import com.examapp.entity.User;
import com.examapp.enums.Role;
import com.examapp.exception.DuplicateResourceException;
import com.examapp.exception.ResourceNotFoundException;
import com.examapp.exception.ForbiddenException;
import com.examapp.repository.ExamRepository;
import com.examapp.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExamServiceTest {

    @Mock private ExamRepository examRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private ExamService examService;

    private User createTeacher() {
        User teacher = new User("Teacher", "teacher@test.com", "hash", Role.TEACHER);
        teacher.setId(1L);
        return teacher;
    }

    private Exam createExam(User teacher) {
        Exam exam = new Exam();
        exam.setId(1L);
        exam.setTitle("Math Test");
        exam.setDescription("Description");
        exam.setPasscode("ABC123");
        exam.setTeacher(teacher);
        exam.setCreatedAt(Instant.now());
        exam.setUpdatedAt(Instant.now());
        return exam;
    }

    @Test
    void createTest_success() {
        User teacher = createTeacher();
        CreateTestRequest request = new CreateTestRequest("Math Test", "Description", "ABC123");

        when(examRepository.existsByPasscode("ABC123")).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(teacher));

        Exam saved = createExam(teacher);
        when(examRepository.save(any(Exam.class))).thenReturn(saved);

        TestResponse response = examService.createTest(1L, request);

        assertEquals("Math Test", response.title());
        assertEquals("ABC123", response.passcode());
        assertEquals(1L, response.teacherId());
    }

    @Test
    void createTest_duplicatePasscode_throwsException() {
        CreateTestRequest request = new CreateTestRequest("Math Test", "Description", "ABC123");
        when(examRepository.existsByPasscode("ABC123")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> examService.createTest(1L, request));
    }

    @Test
    void listTests_returnsTestSummaries() {
        User teacher = createTeacher();
        Exam exam = createExam(teacher);
        when(examRepository.findByTeacherIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(exam));
        when(examRepository.countQuestionsByExamId(1L)).thenReturn(5);

        List<TestSummaryResponse> result = examService.listTests(1L);

        assertEquals(1, result.size());
        assertEquals("Math Test", result.get(0).title());
        assertEquals(5, result.get(0).questionCount());
    }

    @Test
    void getTest_success() {
        User teacher = createTeacher();
        Exam exam = createExam(teacher);
        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));

        TestResponse response = examService.getTest(1L, 1L);

        assertEquals("Math Test", response.title());
        assertEquals("ABC123", response.passcode());
    }

    @Test
    void updateTest_success() {
        User teacher = createTeacher();
        Exam exam = createExam(teacher);
        CreateTestRequest request = new CreateTestRequest("Updated Title", "New Desc", "ABC123");

        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));

        Exam updated = createExam(teacher);
        updated.setTitle("Updated Title");
        when(examRepository.save(any(Exam.class))).thenReturn(updated);

        TestResponse response = examService.updateTest(1L, 1L, request);

        assertEquals("Updated Title", response.title());
    }

    @Test
    void updateTest_passcodeChangedToDuplicate_throwsException() {
        User teacher = createTeacher();
        Exam exam = createExam(teacher);
        CreateTestRequest request = new CreateTestRequest("Title", "Desc", "NEW_CODE");

        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));
        when(examRepository.existsByPasscode("NEW_CODE")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> examService.updateTest(1L, 1L, request));
    }

    @Test
    void deleteTest_success() {
        User teacher = createTeacher();
        Exam exam = createExam(teacher);
        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));

        examService.deleteTest(1L, 1L);

        verify(examRepository).delete(exam);
    }

    @Test
    void getOwnedExam_notOwner_throwsException() {
        User teacher = createTeacher();
        Exam exam = createExam(teacher);
        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));

        assertThrows(ForbiddenException.class, () -> examService.getOwnedExam(999L, 1L));
    }

    @Test
    void getOwnedExam_notFound_throwsException() {
        when(examRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> examService.getOwnedExam(1L, 99L));
    }
}
