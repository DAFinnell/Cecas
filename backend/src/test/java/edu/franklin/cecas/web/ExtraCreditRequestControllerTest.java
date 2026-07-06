package edu.franklin.cecas.web;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.*;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.franklin.cecas.config.SecurityConfig;
import edu.franklin.cecas.service.CecasUserDetailsService;
import edu.franklin.cecas.service.ExtraCreditRequestService;
import edu.franklin.cecas.web.ExtraCreditRequestController;
import edu.franklin.cecas.web.GlobalExceptionHandler;

import java.util.*;

@WebMvcTest(controllers = ExtraCreditRequestController.class)
@Import({ SecurityConfig.class, GlobalExceptionHandler.class })
public class ExtraCreditRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CecasUserDetailsService cecasUserDetailsService;

    @MockitoBean
    private ExtraCreditRequestService extraCreditRequestService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @WithMockUser(username = "student@test.com", roles = { "STUDENT" })
    void testCreateRequestWithoutCourseIdReturnsBadRequest() throws Exception {
        Map<String, Object> request = Map.of(
                "categoryId", 1,
                "description", "Completed an approved extra credit activity");

        mockMvc.perform(post("/api/extra-credit-requests")
                .with(csrf())
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation failed"))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors.courseId").value("courseId is required"));

        verify(extraCreditRequestService, never()).createRequest(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any());
    }
}
