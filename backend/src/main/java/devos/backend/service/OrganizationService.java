package devos.backend.service;

import devos.backend.model.Organization;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationService {
    Organization createOrganization(Organization organization, UUID userId);
    Optional<Organization> getOrganizationById(UUID id);
    Optional<Organization> getOrganizationBySlug(String slug);
    List<Organization> getOrganizationsForUser(UUID userId);
    Organization updateOrganization(UUID id, Organization organization);
    void deleteOrganization(UUID id);
    List<Organization> searchOrganizations(String query);
}
