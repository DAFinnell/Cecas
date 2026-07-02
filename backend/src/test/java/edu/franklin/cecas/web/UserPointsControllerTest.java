package edu.franklin.cecas.web;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import edu.franklin.cecas.config.SecurityConfig;
import edu.franklin.cecas.dto.StudentPointsDTO;
import edu.franklin.cecas.service.CecasUserDetailsService;
import edu.franklin.cecas.service.PointAllocationService;
import edu.franklin.cecas.service.UserService;

@WebMvcTest(controllers = UserController.class)
@Import({ SecurityConfig.class, GlobalExceptionHandler.class })
class UserPointsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CecasUserDetailsService cecasUserDetailsService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private PointAllocationService pointAllocationService;

    @Test
    @WithMockUser(username = "student@test.com", roles = { "STUDENT" })
    void getStudentPointsReturnsCurrentStudentPointSummary() throws Exception {
        when(userService.getStudentPoints("student@test.com"))
                .thenReturn(new StudentPointsDTO(10, 15, 25));

        mockMvc.perform(get("/api/users/me/points"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.issued").value(10))
                .andExpect(jsonPath("$.pending").value(15))
                .andExpect(jsonPath("$.available").value(25));

        verify(userService).getStudentPoints("student@test.com");
    }

    @Test
    @WithMockUser(username = "chair@test.com", roles = { "CHAIR" })
    void getStudentPointsRejectsChairUsers() throws Exception {
        mockMvc.perform(get("/api/users/me/points"))
                .andExpect(status().isForbidden());
    }
}
