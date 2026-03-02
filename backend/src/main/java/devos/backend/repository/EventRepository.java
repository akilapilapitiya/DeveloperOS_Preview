package devos.backend.repository;

import devos.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
    List<Event> findAllByOrganizationId(UUID organizationId);
    Optional<Event> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
