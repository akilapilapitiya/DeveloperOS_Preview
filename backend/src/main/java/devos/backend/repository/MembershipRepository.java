package devos.backend.repository;

import devos.backend.model.Membership;
import devos.backend.model.Organization;
import devos.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, UUID> {
    
    List<Membership> findByUser(User user);
    
    List<Membership> findByOrganization(Organization organization);
    
    List<Membership> findByOrganizationAndStatus(Organization organization, Membership.EnrollmentStatus status);
    
    boolean existsByUserAndOrganization(User user, Organization organization);
    
    Optional<Membership> findByUserAndOrganization(User user, Organization organization);
}
