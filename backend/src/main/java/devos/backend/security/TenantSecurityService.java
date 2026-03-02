package devos.backend.security;

import devos.backend.model.Event;
import devos.backend.model.Membership;
import devos.backend.model.Organization;
import devos.backend.model.Project;
import devos.backend.model.User;
import devos.backend.model.ProjectMembership;
import devos.backend.model.EventRole;
import devos.backend.repository.EventParticipantRepository;
import devos.backend.repository.EventRepository;
import devos.backend.repository.MembershipRepository;
import devos.backend.repository.OrganizationRepository;
import devos.backend.repository.ProjectMembershipRepository;
import devos.backend.repository.ProjectRepository;
import devos.backend.repository.UserRepository;
import devos.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@Component("security")
@RequiredArgsConstructor
public class TenantSecurityService {

    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final ProjectRepository projectRepository;
    private final EventRepository eventRepository;
    private final EventParticipantRepository participantRepository;
    private final ProjectMembershipRepository projectMembershipRepository;
    private final UserService userService;

    public boolean hasOrgAccess(UUID organizationId) {
        User user = userService.getCurrentUser();
        if (user == null) return false;

        Organization org = organizationRepository.findById(organizationId).orElse(null);
        if (org == null) return false;

        return membershipRepository.findByUserAndOrganization(user, org)
                .map(m -> m.getStatus() == Membership.EnrollmentStatus.ACTIVE)
                .orElse(false);
    }

    public boolean hasOrgRole(UUID organizationId, String... roles) {
        User user = userService.getCurrentUser();
        if (user == null) return false;

        Organization org = organizationRepository.findById(organizationId).orElse(null);
        if (org == null) return false;

        return membershipRepository.findByUserAndOrganization(user, org)
                .map(m -> m.getStatus() == Membership.EnrollmentStatus.ACTIVE && 
                          Arrays.asList(roles).contains(m.getRole().name()))
                .orElse(false);
    }

    public boolean hasProjectAccess(UUID projectId) {
        User user = userService.getCurrentUser();
        if (user == null) return false;

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return false;

        // Org-level access (any active member of the org can view for now)
        if (project.getOrganization() != null && membershipRepository.existsByUserAndOrganization(user, project.getOrganization())) {
            return true;
        }
        
        // Project-level access
        return projectMembershipRepository.findByUserAndProject(user, project).isPresent();
    }

    public boolean hasProjectRole(UUID projectId, String... roles) {
        User user = userService.getCurrentUser();
        if (user == null) return false;

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return false;

        // Org Owners/Admins have all project roles
        if (project.getOrganization() != null) {
            Optional<Membership> orgMembership = membershipRepository.findByUserAndOrganization(user, project.getOrganization());
            if (orgMembership.isPresent() && 
                (orgMembership.get().getRole() == Membership.MembershipRole.OWNER || orgMembership.get().getRole() == Membership.MembershipRole.ADMIN)) {
                return true;
            }
        }

        // Check project-level membership
        return projectMembershipRepository.findByUserAndProject(user, project)
                .map(m -> Arrays.asList(roles).contains(m.getRole().name()))
                .orElse(false);
    }

    public boolean hasEventAccess(UUID eventId, String... allowedRoles) {
        if (!isAuthenticated()) return false;
        
        UUID userId = getCurrentUserId();
        
        // 1. Check Event Participant specific role
        for (String role : allowedRoles) {
            EventRole eventRole;
            try {
                eventRole = EventRole.valueOf(role);
                if (participantRepository.existsByEventIdAndUserIdAndRole(eventId, userId, eventRole)) {
                    return true;
                }
            } catch (IllegalArgumentException e) {
                // Not an EventRole
            }
        }
        
        // 2. Fallback to Organization Role lookup
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event == null) return false;
        
        return hasOrgRole(event.getOrganization().getId(), allowedRoles);
    }

    private boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return UUID.fromString(jwt.getSubject());
        }
        return null;
    }
}
