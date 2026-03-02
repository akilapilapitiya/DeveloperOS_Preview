package devos.backend.service;

import devos.backend.dto.FollowStatsDto;
import devos.backend.dto.FollowUserDto;

import java.util.List;

public interface FollowService {

    /** Current user follows the given username. */
    void follow(String followerKeycloakId, String targetUsername);

    /** Current user unfollows the given username. */
    void unfollow(String followerKeycloakId, String targetUsername);

    /** Is {followerKeycloakId} currently following {targetUsername}? */
    boolean isFollowing(String followerKeycloakId, String targetUsername);

    /** Follower + following counts for {username}, with optional isFollowing flag. */
    FollowStatsDto getStats(String username, String viewerKeycloakId);

    /** Users who follow {username}. */
    List<FollowUserDto> getFollowers(String username);

    /** Users that {username} follows. */
    List<FollowUserDto> getFollowing(String username);
}
