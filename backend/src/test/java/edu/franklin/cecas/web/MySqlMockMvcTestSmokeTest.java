package edu.franklin.cecas.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.franklin.cecas.support.MySqlMockMvcTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

@MySqlMockMvcTest
public class MySqlMockMvcTestSmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void authEndpointIsReachable() throws Exception {
        mockMvc.perform(get("/api/auth/me")).andExpect(status().isOk());
    }
}
