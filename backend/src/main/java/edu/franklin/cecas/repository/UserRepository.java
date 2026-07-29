package edu.franklin.cecas.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.domain.UserRole;
import jakarta.persistence.LockModeType;

public interface UserRepository extends JpaRepository<User, Integer> {
    
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<User> findByStudentId(Integer studentId);

    List<User> findAllByRoleAndIsActiveTrue(UserRole role);

    List<User> findByProgram(String program);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.id = :id")
    Optional<User> findByIdForUpdate(Integer id);
}
