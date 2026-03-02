package devos.backend.service;

import devos.backend.model.User;
import devos.backend.dto.ProfileUpdateDto;
import devos.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User getOrCreateUser(String keycloakId, String username, String email, String firstName, String lastName) {
        return userRepository.findByKeycloakId(keycloakId)
                .map(existingUser -> {
                    if (existingUser.getUsername() == null && username != null) {
                        existingUser.setUsername(username);
                        return userRepository.save(existingUser);
                    }
                    return existingUser;
                })
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .keycloakId(keycloakId)
                            .username(username)
                            .email(email)                            
                            .firstName(firstName)
                            .lastName(lastName)
                            .active(true)
                            .build();
                    return userRepository.save(newUser);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<User> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            String keycloakId = jwt.getSubject();
            return userRepository.findByKeycloakId(keycloakId).orElse(null);
        }
        return null;
    }

    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateProfile(String keycloakId, ProfileUpdateDto updates) {
        // Mirrors OrganizationServiceImpl.updateOrganization exactly
        return userRepository.findByKeycloakId(keycloakId)
                .map(existing -> {
                    if (updates.getBio() != null) existing.setBio(updates.getBio());
                    if (updates.getCompany() != null) existing.setCompany(updates.getCompany());
                    if (updates.getLocation() != null) existing.setLocation(updates.getLocation());
                    if (updates.getWebsiteUrl() != null) existing.setWebsiteUrl(updates.getWebsiteUrl());
                    if (updates.getTwitterUsername() != null) existing.setTwitterUsername(updates.getTwitterUsername());
                    if (updates.getPhoneNumber() != null) existing.setPhoneNumber(updates.getPhoneNumber());
                    if (updates.getSecondaryEmail() != null) existing.setSecondaryEmail(updates.getSecondaryEmail());
                    return userRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("User not found: " + keycloakId));
    }

    @Override
    @Transactional
    public User updateAvatarPath(String keycloakId, String fileName) {
        return userRepository.findByKeycloakId(keycloakId)
                .map(existing -> {
                    existing.setAvatarPath(fileName);
                    return userRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("User not found: " + keycloakId));
    }
}
