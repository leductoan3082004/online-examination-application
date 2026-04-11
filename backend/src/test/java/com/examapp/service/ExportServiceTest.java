package com.examapp.service;

import com.examapp.entity.*;
import com.examapp.enums.Role;
import com.examapp.repository.TestAttemptRepository;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExportServiceTest {

    @Mock private TestAttemptRepository testAttemptRepository;
    @Mock private ExamService examService;
    @Mock private HttpServletResponse response;
    @InjectMocks private ExportService exportService;

    private Exam createExam() {
        User teacher = new User("Teacher", "t@t.com", "hash", Role.TEACHER);
        teacher.setId(1L);
        Exam e = new Exam();
        e.setId(10L);
        e.setTitle("Math Test");
        e.setTeacher(teacher);
        return e;
    }

    private TestAttempt createAttempt(Exam exam) {
        User student = new User("Alice", "alice@s.com", "N/A", Role.STUDENT);
        student.setId(5L);
        TestAttempt ta = new TestAttempt();
        ta.setId(1L);
        ta.setExam(exam);
        ta.setStudent(student);
        ta.setScore(80);
        ta.setMaxScore(100);
        ta.setSubmittedAt(Instant.parse("2026-04-11T10:00:00Z"));
        return ta;
    }

    @Test
    void exportCsv_writesCorrectContent() throws IOException {
        Exam exam = createExam();
        TestAttempt attempt = createAttempt(exam);

        when(examService.getOwnedExam(1L, 10L)).thenReturn(exam);
        when(testAttemptRepository.findByExamId(10L)).thenReturn(List.of(attempt));

        StringWriter stringWriter = new StringWriter();
        PrintWriter printWriter = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(printWriter);

        exportService.exportCsv(1L, 10L, response);

        String csv = stringWriter.toString();
        assertTrue(csv.contains("Student Name,Score,Max Score,Percentage,Submitted Date"));
        assertTrue(csv.contains("Alice"));
        assertTrue(csv.contains("80"));
        assertTrue(csv.contains("100"));
        verify(response).setContentType("text/csv");
    }

    @Test
    void exportExcel_setsCorrectHeaders() throws IOException {
        Exam exam = createExam();
        when(examService.getOwnedExam(1L, 10L)).thenReturn(exam);
        when(testAttemptRepository.findByExamId(10L)).thenReturn(List.of());

        ServletOutputStream outputStream = mock(ServletOutputStream.class);
        when(response.getOutputStream()).thenReturn(outputStream);

        exportService.exportExcel(1L, 10L, response);

        verify(response).setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        verify(response).setHeader(eq("Content-Disposition"), contains("Math_Test_results.xlsx"));
    }
}
