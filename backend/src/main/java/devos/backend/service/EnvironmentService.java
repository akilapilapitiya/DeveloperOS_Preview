package devos.backend.service;

import devos.backend.model.Environment;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EnvironmentService {
    Environment createEnvironment(UUID projectId, Environment environment);
    Optional<Environment> getEnvironmentById(UUID id);
    Optional<Environment> getEnvironmentBySlug(String slug);
    List<Environment> getEnvironmentsByProject(UUID projectId);
    Environment updateEnvironment(UUID id, Environment environment);
    void deleteEnvironment(UUID id);
}
