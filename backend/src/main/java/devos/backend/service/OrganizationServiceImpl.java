package devos.backend.service;

import devos.backend.model.Membership;
import devos.backend.model.Organization;
import devos.backend.model.User;
import devos.backend.repository.MembershipRepository;
import devos.backend.repository.OrganizationRepository;
import devos.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Override
    public Organization createOrganization(Organization organization, UUID userId) {
        if (organizationRepository.existsBySlug(organization.getSlug())) {
            throw new RuntimeException("Organization with slug " + organization.getSlug() + " already exists");
        }
        
        Organization savedOrg = organizationRepository.save(organization);
        
        // Automatically assign creator as OWNER
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Membership membership = Membership.builder()
                .user(creator)
                .organization(savedOrg)
                .role(Membership.MembershipRole.OWNER)
                .build();
        
        membershipRepository.save(membership);
        
        return savedOrg;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Organization> getOrganizationById(UUID id) {
        return organizationRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Organization> getOrganizationBySlug(String slug) {
        return organizationRepository.findBySlug(slug);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Organization> getOrganizationsForUser(UUID userId) {
        return organizationRepository.findAllByMembershipsUserId(userId);
    }

    @Override
    public Organization updateOrganization(UUID id, Organization organization) {
        return organizationRepository.findById(id)
                .map(existing -> {
                    if (organization.getName() != null) existing.setName(organization.getName());
                    if (organization.getDescription() != null) existing.setDescription(organization.getDescription());
                    // active is primitive/boolean, but we should only update if it's a Partial update? 
                    // For now, let's assume it's always sent or we handle it.
                    if (organization.getActive() != null) existing.setActive(organization.getActive());
                    
                    if (organization.getLocation() != null) existing.setLocation(organization.getLocation());
                    if (organization.getEstablishedDate() != null) existing.setEstablishedDate(organization.getEstablishedDate());
                    if (organization.getIndustry() != null) existing.setIndustry(organization.getIndustry());
                    if (organization.getWebsite() != null) existing.setWebsite(organization.getWebsite());
                    if (organization.getBannerPath() != null) existing.setBannerPath(organization.getBannerPath());
                    if (organization.getLogoPath() != null) existing.setLogoPath(organization.getLogoPath());
                    
                    return organizationRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Organization not found with id " + id));
    }

    @Override
    public void deleteOrganization(UUID id) {
        organizationRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Organization> searchOrganizations(String query) {
        if (query == null || query.trim().isEmpty()) {
            return organizationRepository.findAll();
        }
        return organizationRepository.findByNameContainingIgnoreCaseOrSlugContainingIgnoreCase(query, query);
    }
}
