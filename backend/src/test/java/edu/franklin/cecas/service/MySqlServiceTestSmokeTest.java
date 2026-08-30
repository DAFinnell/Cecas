package edu.franklin.cecas.service;

import static org.assertj.core.api.Assertions.assertThat;

import edu.franklin.cecas.repository.UserRepository;
import edu.franklin.cecas.support.MySqlServiceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@MySqlServiceTest
public class MySqlServiceTestSmokeTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void contextLoadsAndRepositoryAvailable() {
        assertThat(userRepository).isNotNull();
    }
}
