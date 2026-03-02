package devos.backend.repository;

import devos.backend.model.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserFollowRepository extends JpaRepository<UserFollow, UUID> {

    Optional<UserFollow> findByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    /** All users that {followerId} follows */
    List<UserFollow> findAllByFollowerId(UUID followerId);

    /** All users that follow {followingId} */
    List<UserFollow> findAllByFollowingId(UUID followingId);

    long countByFollowerId(UUID followerId);

    long countByFollowingId(UUID followingId);

    @Modifying
    @Query("DELETE FROM UserFollow uf WHERE uf.follower.id = :followerId AND uf.following.id = :followingId")
    void deleteByFollowerIdAndFollowingId(@Param("followerId") UUID followerId,
                                         @Param("followingId") UUID followingId);
}
