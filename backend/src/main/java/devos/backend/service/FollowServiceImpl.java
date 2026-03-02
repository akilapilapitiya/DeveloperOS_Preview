package devos.backend.service;

import devos.backend.dto.FollowStatsDto;
import devos.backend.dto.FollowUserDto;
import devos.backend.model.User;
import devos.backend.model.UserFollow;
import devos.backend.repository.UserFollowRepository;
import devos.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FollowServiceImpl implements FollowService {

    private final UserFollowRepository followRepository;
    private final UserRepository userRepository;

    @Override
    public void follow(String followerKeycloakId, String targetUsername) {
        User follower = getByKeycloak(followerKeycloakId);
        User target = getByGithubUsername(targetUsername);

        if (follower.getId().equals(target.getId())) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }
        if (followRepository.existsByFollowerIdAndFollowingId(follower.getId(), target.getId())) {
            return; // idempotent – already following
        }
        followRepository.save(
            UserFollow.builder().follower(follower).following(target).build()
        );
    }

    @Override
    public void unfollow(String followerKeycloakId, String targetUsername) {
        User follower = getByKeycloak(followerKeycloakId);
        User target = getByGithubUsername(targetUsername);
        followRepository.deleteByFollowerIdAndFollowingId(follower.getId(), target.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFollowing(String followerKeycloakId, String targetUsername) {
        User follower = getByKeycloak(followerKeycloakId);
        User target = getByGithubUsername(targetUsername);
        return followRepository.existsByFollowerIdAndFollowingId(follower.getId(), target.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public FollowStatsDto getStats(String username, String viewerKeycloakId) {
        User target = getByGithubUsername(username);
        long followers = followRepository.countByFollowingId(target.getId());
        long following = followRepository.countByFollowerId(target.getId());

        boolean isFollowing = false;
        if (viewerKeycloakId != null) {
            userRepository.findByKeycloakId(viewerKeycloakId).ifPresent(viewer -> {
                // capture in effectively-final wrapper – just check inline
            });
            isFollowing = userRepository.findByKeycloakId(viewerKeycloakId)
                .map(viewer -> followRepository.existsByFollowerIdAndFollowingId(viewer.getId(), target.getId()))
                .orElse(false);
        }

        return FollowStatsDto.builder()
            .followerCount(followers)
            .followingCount(following)
            .isFollowing(isFollowing)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FollowUserDto> getFollowers(String username) {
        User target = getByGithubUsername(username);
        return followRepository.findAllByFollowingId(target.getId()).stream()
            .map(uf -> mapToFollowUser(uf.getFollower()))
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FollowUserDto> getFollowing(String username) {
        User target = getByGithubUsername(username);
        return followRepository.findAllByFollowerId(target.getId()).stream()
            .map(uf -> mapToFollowUser(uf.getFollowing()))
            .toList();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User getByKeycloak(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId)
            .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    private User getByGithubUsername(String githubUsername) {
        return userRepository.findByGithubUsername(githubUsername)
            .orElseThrow(() -> new RuntimeException("User not found: " + githubUsername));
    }

    private FollowUserDto mapToFollowUser(User u) {
        return FollowUserDto.builder()
            .id(u.getId())
            .githubUsername(u.getGithubUsername())
            .firstName(u.getFirstName())
            .lastName(u.getLastName())
            .avatarPath(u.getAvatarPath())
            .githubAvatarUrl(u.getGithubAvatarUrl())
            .bio(u.getBio())
            .build();
    }
}
