package devos.backend.repository;

import devos.backend.model.EventParticipant;
import devos.backend.model.EventRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventParticipantRepository extends JpaRepository<EventParticipant, UUID> {
    List<EventParticipant> findByEventId(UUID eventId);
    List<EventParticipant> findByUserId(UUID userId);
    Optional<EventParticipant> findByEventIdAndUserId(UUID eventId, UUID userId);
    boolean existsByEventIdAndUserId(UUID eventId, UUID userId);
    boolean existsByEventIdAndUserIdAndRole(UUID eventId, UUID userId, EventRole role);
}
