package devos.backend.controller;

import devos.backend.dto.ProfileUpdateDto;
import devos.backend.dto.PublicProfileDto;
import devos.backend.dto.UserDto;
import devos.backend.dto.UserSkillDto;
import devos.backend.model.User;
import devos.backend.repository.UserRepository;
import devos.backend.repository.UserSkillRepository;
import devos.backend.service.FollowService;
import devos.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final FollowService followService;

    @Value("${app.storage.avatars:/Users/akila/Developer/DeveloperOS/storage/avatars}")
    private String avatarStoragePath;

    // ── Public profile view ───────────────────────────────────────────────────

    /**
     * GET /api/v1/profile/u/{username}
     * Publicly readable profile by GitHub username.
     * Returns user info + their skills.
     */
    @GetMapping("/u/{username}")
    public ResponseEntity<?> getPublicProfile(@PathVariable String username,
                                               Authentication authentication) {
        final String viewerKeycloakId = (authentication instanceof JwtAuthenticationToken jwtAuth)
                ? jwtAuth.getToken().getSubject()
                : null;
        return userRepository.findByGithubUsername(username)
                .map(user -> {
                    List<UserSkillDto> skills = userSkillRepository.findByUserId(user.getId())
                            .stream()
                            .map(us -> UserSkillDto.builder()
                                    .id(us.getId())
                                    .skillId(us.getSkill().getId())
                                    .name(us.getSkill().getName())
                                    .category(us.getSkill().getCategory().name())
                                    .iconSlug(us.getSkill().getIconSlug())
                                    .level(us.getLevel())
                                    .build())
                            .collect(Collectors.toList());

                    var stats = followService.getStats(username, viewerKeycloakId);

                    PublicProfileDto dto = PublicProfileDto.builder()
                            .id(user.getId())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .githubUsername(user.getGithubUsername())
                            .githubAvatarUrl(user.getGithubAvatarUrl())
                            .avatarPath(user.getAvatarPath())
                            .bio(user.getBio())
                            .company(user.getCompany())
                            .location(user.getLocation())
                            .websiteUrl(user.getWebsiteUrl())
                            .twitterUsername(user.getTwitterUsername())
                            .skills(skills)
                            .followerCount(stats.getFollowerCount())
                            .followingCount(stats.getFollowingCount())
                            .isFollowedByCurrentUser(stats.isFollowing())
                            .build();

                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Authenticated endpoints ───────────────────────────────────────────────

    @PostMapping("/sync")
    public ResponseEntity<UserDto> syncProfile(@AuthenticationPrincipal Jwt jwt) {
        String keycloakId = jwt.getSubject();
        String username = jwt.getClaimAsString("preferred_username");
        String email = jwt.getClaimAsString("email");
        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");

        log.info("Syncing profile for user: {}", email);
        User user = userService.getOrCreateUser(keycloakId, username, email, firstName, lastName);
        return ResponseEntity.ok(mapToDto(user));
    }

    @PutMapping
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ProfileUpdateDto dto) {

        try {
            String keycloakId = jwt.getSubject();
            log.info("Updating profile for keycloakId: {}", keycloakId);
            User updated = userService.updateProfile(keycloakId, dto);
            return ResponseEntity.ok(mapToDto(updated));
        } catch (Exception e) {
            log.error("Error updating profile: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("file") MultipartFile file) {

        try {
            String keycloakId = jwt.getSubject();
            log.info("Avatar upload for keycloakId: {}. File size: {}", keycloakId, file.getSize());

            Path storageDir = Paths.get(avatarStoragePath).toAbsolutePath();
            Files.createDirectories(storageDir);
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path target = storageDir.resolve(fileName);
            Files.copy(file.getInputStream(), target);
            log.info("Avatar stored as: {}", fileName);

            User updated = userService.updateAvatarPath(keycloakId, fileName);
            return ResponseEntity.ok(mapToDto(updated));
        } catch (Exception e) {
            log.error("Failed to upload avatar: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .bio(user.getBio())
                .company(user.getCompany())
                .location(user.getLocation())
                .websiteUrl(user.getWebsiteUrl())
                .twitterUsername(user.getTwitterUsername())
                .phoneNumber(user.getPhoneNumber())
                .secondaryEmail(user.getSecondaryEmail())
                .githubUsername(user.getGithubUsername())
                .githubAvatarUrl(user.getGithubAvatarUrl())
                .avatarPath(user.getAvatarPath())
                .active(user.isActive())
                .build();
    }
}
