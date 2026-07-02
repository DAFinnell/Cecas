package edu.franklin.cecas.service;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import edu.franklin.cecas.domain.User;
import edu.franklin.cecas.domain.UserRole;
import edu.franklin.cecas.dto.ChangePasswordRequest;
import edu.franklin.cecas.dto.StudentPointsDTO;
import edu.franklin.cecas.dto.UserDTO;
import edu.franklin.cecas.dto.UserProfileResponse;
import edu.franklin.cecas.exception.InvalidPasswordException;
import edu.franklin.cecas.exception.PasswordChangeNotRequiredException;
import edu.franklin.cecas.exception.PasswordMismatchException;
import edu.franklin.cecas.exception.UnauthorizedRoleException;
import edu.franklin.cecas.repository.UserRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PointAllocationService pointAllocationService;

    UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, PointAllocationService pointAllocationService) {    
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.pointAllocationService = pointAllocationService;
    }
    
    /**
     * Get student by studentId. Throws if not found.
     * @param studentId
     * @return userDTO
     */
    public UserDTO getStudentByStudentId(Integer studentId) {
        return userRepository.findByStudentId(studentId)
                .map(UserDTO::new)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Get user profile information for the currently authenticated user.
     * @param email
     * @return
     */
    public UserProfileResponse getUserProfile(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .map(user -> new UserProfileResponse(
                        user.getEmail(),
                        user.getFullName(),
                        user.getRole().name()
                ))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public StudentPointsDTO getStudentPoints(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (user.getRole() != UserRole.STUDENT) {
            throw new UnauthorizedRoleException("Only students have an extra credit point summary");
        }

        return pointAllocationService.getStudentPoints(user.getId());
    }

    /**
     * Normal Change Password logic
     * @param email
     * @param request
     * 
     */
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("New password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Force change password for program chairs and clear mustChangePassword flag.
     * @param email
     * @param request
     */
    public void forceChangePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (user.getRole() != UserRole.CHAIR) {
            throw new UnauthorizedRoleException("Only program chairs can force change their password");
        }

        if (!Boolean.TRUE.equals(user.getMustChangePassword())) {
            throw new PasswordChangeNotRequiredException ("Password change is not required");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("New password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);

        userRepository.save(user);
    }
}
