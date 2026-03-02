package devos.backend.service;

import devos.backend.model.Environment;
import devos.backend.model.Project;
import devos.backend.repository.EnvironmentRepository;
import devos.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class EnvironmentServiceImpl implements EnvironmentService {

    private final EnvironmentRepository environmentRepository;
    private final ProjectRepository projectRepository;

    @Override
    public Environment createEnvironment(UUID projectId, Environment environment) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (environmentRepository.existsBySlug(environment.getSlug())) {
            throw new RuntimeException("Environment with slug " + environment.getSlug() + " already exists");
        }
        
        environment.setProject(project);
        return environmentRepository.save(environment);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Environment> getEnvironmentById(UUID id) {
        return environmentRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Environment> getEnvironmentBySlug(String slug) {
        return environmentRepository.findBySlug(slug);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Environment> getEnvironmentsByProject(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return environmentRepository.findByProject(project);
    }

    @Override
    public Environment updateEnvironment(UUID id, Environment environment) {
        return environmentRepository.findById(id)
                .map(existing -> {
                    existing.setName(environment.getName());
                    existing.setActive(environment.isActive());
                    return environmentRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Environment not found"));
    }

    @Override
    public void deleteEnvironment(UUID id) {
        environmentRepository.deleteById(id);
    }
}
