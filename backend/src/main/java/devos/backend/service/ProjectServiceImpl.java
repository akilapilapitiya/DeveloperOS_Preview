package devos.backend.service;

import devos.backend.dto.ProjectDto;
import devos.backend.model.Event;
import devos.backend.model.Organization;
import devos.backend.model.Project;
import devos.backend.model.ProjectMembership;
import devos.backend.model.User;
import devos.backend.repository.EventRepository;
import devos.backend.repository.OrganizationRepository;
import devos.backend.repository.ProjectMembershipRepository;
import devos.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@lombok.extern.slf4j.Slf4j
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;
    private final EventRepository eventRepository;
    private final ProjectMembershipRepository projectMembershipRepository;
    private final UserService userService;
    private final GitHubApiService gitHubApiService;

    @Override
    public ProjectDto createProject(UUID organizationId, Project project) {
        if (organizationId != null) {
            Organization organization = organizationRepository.findById(organizationId)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));
            project.setOrganization(organization);
        }
        
        if (projectRepository.existsBySlug(project.getSlug())) {
            throw new RuntimeException("Project with slug " + project.getSlug() + " already exists");
        }

        project.setCreator(userService.getCurrentUser());
        
        Project savedProject = projectRepository.save(project);
        
        // Initial Owner Membership
        projectMembershipRepository.save(ProjectMembership.builder()
                .project(savedProject)
                .user(savedProject.getCreator())
                .role(ProjectMembership.ProjectRole.OWNER)
                .build());

        return mapToDto(savedProject);
    }

    @Override
    public ProjectDto createProject(UUID organizationId, ProjectDto dto) {
        Organization organization = null;
        if (organizationId != null) {
            organization = organizationRepository.findById(organizationId)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));
        }

        if (projectRepository.existsBySlug(dto.getSlug())) {
            throw new RuntimeException("Project with slug " + dto.getSlug() + " already exists");
        }

        if (organizationId != null && dto.getEventId() == null) {
            throw new RuntimeException("Projects created within an organization must be associated with an event.");
        }

        Event event = null;
        if (dto.getEventId() != null) {
            event = eventRepository.findById(dto.getEventId())
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            
            if (event.getMaxProjectsPerUser() != null) {
                long currentCount = projectRepository.countByEventIdAndCreatorId(event.getId(), userService.getCurrentUser().getId());
                if (currentCount >= event.getMaxProjectsPerUser()) {
                    throw new RuntimeException("You have reached the maximum number of projects allowed for this event.");
                }
            }
        }

        Project project = Project.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .description(dto.getDescription())
                .organization(organization)
                .event(event)
                .creator(userService.getCurrentUser())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .githubRepoId(dto.getGithubRepoId())
                .githubRepoFullName(dto.getGithubRepoFullName())
                .build();

        Project savedProject = projectRepository.save(project);

        // Initial Owner Membership
        projectMembershipRepository.save(ProjectMembership.builder()
                .project(savedProject)
                .user(savedProject.getCreator())
                .role(ProjectMembership.ProjectRole.OWNER)
                .build());

        // Auto-sync if GitHub repo is provided
        if (dto.getGithubRepoFullName() != null && !dto.getGithubRepoFullName().isEmpty()) {
            try {
                syncGitHubMetadata(savedProject.getId());
                savedProject = projectRepository.findById(savedProject.getId()).orElse(savedProject);
            } catch (Exception e) {
                log.error("Failed to sync GitHub metadata for new project {}: {}", savedProject.getId(), e.getMessage());
            }
        }

        return mapToDto(savedProject);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProjectDto> getProjectById(UUID id) {
        return projectRepository.findById(id).map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProjectDto> getProjectBySlug(String slug) {
        return projectRepository.findBySlug(slug).map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDto> getProjectsForCurrentUser() {
        User user = userService.getCurrentUser();
        if (user == null) return List.of();
        return projectMembershipRepository.findByUser(user).stream()
                .map(m -> mapToDto(m.getProject()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDto> searchProjects(String query) {
        return projectRepository.findByNameContainingIgnoreCaseOrSlugContainingIgnoreCase(query, query).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDto> getProjectsByOrganization(UUID organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        return projectRepository.findByOrganization(organization).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectDto updateProject(UUID id, Project project) {
        return projectRepository.findById(id)
                .map(existing -> {
                    if (project.getName() != null) existing.setName(project.getName());
                    if (project.getDescription() != null) existing.setDescription(project.getDescription());
                    // Since Project.active is now Boolean
                    if (project.getActive() != null) existing.setActive(project.getActive());
                    if (project.getEvent() != null) existing.setEvent(project.getEvent());
                    return mapToDto(projectRepository.save(existing));
                })
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public ProjectDto updateProject(UUID id, ProjectDto dto) {
        return projectRepository.findById(id)
                .map(existing -> {
                    if (dto.getName() != null) existing.setName(dto.getName());
                    if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
                    if (dto.getActive() != null) existing.setActive(dto.getActive());
                    if (dto.getVisibility() != null) existing.setVisibility(dto.getVisibility());
                    if (dto.getRepositoryUrl() != null) existing.setRepositoryUrl(dto.getRepositoryUrl());
                    if (dto.getWebsiteUrl() != null) existing.setWebsiteUrl(dto.getWebsiteUrl());
                    if (dto.getDefaultBranch() != null) existing.setDefaultBranch(dto.getDefaultBranch());
                    if (dto.getLanguage() != null) existing.setLanguage(dto.getLanguage());
                    if (dto.getAvatarPath() != null) existing.setAvatarPath(dto.getAvatarPath());
                    if (dto.getReadmeContent() != null) existing.setReadmeContent(dto.getReadmeContent());
                    if (dto.getTags() != null) existing.setTags(dto.getTags());
                    if (dto.getGithubRepoId() != null) existing.setGithubRepoId(dto.getGithubRepoId());
                    if (dto.getGithubRepoFullName() != null) existing.setGithubRepoFullName(dto.getGithubRepoFullName());
                    if (dto.getStars() != null) existing.setStars(dto.getStars());
                    if (dto.getForks() != null) existing.setForks(dto.getForks());
                    
                    if (dto.getEventId() != null) {
                        Event event = eventRepository.findById(dto.getEventId())
                                .orElseThrow(() -> new RuntimeException("Event not found"));
                        
                        // Only check limit if they are associating to a NEW event
                        if (existing.getEvent() == null || !existing.getEvent().getId().equals(event.getId())) {
                            if (event.getMaxProjectsPerUser() != null) {
                                long currentCount = projectRepository.countByEventIdAndCreatorId(event.getId(), userService.getCurrentUser().getId());
                                if (currentCount >= event.getMaxProjectsPerUser()) {
                                    throw new RuntimeException("You have reached the maximum number of projects allowed for this event.");
                                }
                            }
                        }
                        
                        existing.setEvent(event);
                    }
                    return mapToDto(projectRepository.save(existing));
                })
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    @Override
    public ProjectDto updateAvatar(UUID id, String avatarPath) {
        log.info("DB UPDATE: Setting avatar for project {} to '{}'", id, avatarPath);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setAvatarPath(avatarPath);
        Project saved = projectRepository.saveAndFlush(project);
        log.info("DB UPDATE SUCCESS: Entity avatarPath is now '{}'", saved.getAvatarPath());
        return mapToDto(saved);
    }

    @Override
    public void deleteProject(UUID id) {
        projectRepository.deleteById(id);
    }

    private ProjectDto mapToDto(Project project) {
        log.info("MAPPING: Project(id={}) setting avatarPath='{}'", project.getId(), project.getAvatarPath());
        ProjectDto dto = ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .slug(project.getSlug())
                .description(project.getDescription())
                .organizationId(project.getOrganization() != null ? project.getOrganization().getId() : null)
                .eventId(project.getEvent() != null ? project.getEvent().getId() : null)
                .eventName(project.getEvent() != null ? project.getEvent().getName() : null)
                .creatorId(project.getCreator() != null ? project.getCreator().getId() : null)
                .active(project.getActive())
                .visibility(project.getVisibility())
                .repositoryUrl(project.getRepositoryUrl())
                .defaultBranch(project.getDefaultBranch())
                .language(project.getLanguage())
                .websiteUrl(project.getWebsiteUrl())
                .avatarPath(project.getAvatarPath())
                .readmeContent(project.getReadmeContent())
                .tags(project.getTags() != null ? new java.util.ArrayList<>(project.getTags()) : null)
                .githubRepoId(project.getGithubRepoId())
                .githubRepoFullName(project.getGithubRepoFullName())
                .stars(project.getStars())
                .forks(project.getForks())
                .build();
        log.info("MAPPING DONE: DTO avatarPath is '{}'", dto.getAvatarPath());
        return dto;
    }

    @Override
    public List<String> getAvailableGitHubRepositories(UUID projectId) {
        User user = userService.getCurrentUser();
        String token = user.getGithubAccessToken();
        
        if (token == null) {
            log.warn("User {} has no GitHub token, cannot list repositories", user.getId());
            return List.of();
        }
        
        return gitHubApiService.listRepositories(token);
    }

    @Override
    public void syncGitHubMetadata(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        User user = userService.getCurrentUser();
        String token = user.getGithubAccessToken();
        String repoFullName = project.getGithubRepoFullName();
        
        if (repoFullName == null && project.getRepositoryUrl() != null) {
            String url = project.getRepositoryUrl();
            if (url.contains("github.com/")) {
                String fullPath = url.substring(url.indexOf("github.com/") + 11);
                if (fullPath.endsWith(".git")) fullPath = fullPath.substring(0, fullPath.length() - 4);
                if (fullPath.endsWith("/")) fullPath = fullPath.substring(0, fullPath.length() - 1);
                repoFullName = fullPath;
                log.info("Extracted repoFullName '{}' from repositoryUrl '{}'", repoFullName, url);
            }
        }

        if (token == null) {
            log.warn("Sync failed: User not connected to GitHub");
            throw new RuntimeException("User not connected to GitHub. Please connect your account first.");
        }

        if (repoFullName == null) {
            log.warn("Sync failed: Project {} has no linked GitHub repository", projectId);
            throw new RuntimeException("No GitHub repository linked to this project.");
        }
        
        GitHubApiService.RepositoryMetadata metadata = gitHubApiService.getRepositoryMetadata(token, repoFullName);
        
        project.setStars(metadata.getStars());
        project.setForks(metadata.getForks());
        project.setLanguage(metadata.getLanguage());
        project.setDefaultBranch(metadata.getDefaultBranch());
        project.setReadmeContent(metadata.getReadme());
        project.setWebsiteUrl(metadata.getHomepage());
        
        // Merge topics into tags
        if (metadata.getTopics() != null && !metadata.getTopics().isEmpty()) {
            java.util.List<String> currentTags = project.getTags();
            if (currentTags == null) currentTags = new java.util.ArrayList<>();
            for (String topic : metadata.getTopics()) {
                if (!currentTags.contains(topic)) {
                    currentTags.add(topic);
                }
            }
            project.setTags(currentTags);
        }

        if (project.getDescription() == null || project.getDescription().isEmpty()) {
            project.setDescription(metadata.getDescription());
        }
        
        projectRepository.save(project);
        log.info("Synced metadata for project {} from repo {}", projectId, repoFullName);
    }

    @Override
    public List<GitHubApiService.CommitDto> getProjectCommits(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        User user = userService.getCurrentUser();
        String token = user.getGithubAccessToken();
        String repoFullName = project.getGithubRepoFullName();

        if (token == null || repoFullName == null) {
            log.warn("Cannot fetch commits: User not connected to GitHub or project has no linked repo");
            return List.of();
        }

        return gitHubApiService.fetchCommits(token, repoFullName, 10);
    }

    @Override
    public GitHubApiService.GitHubInsightsDto getProjectGitHubInsights(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        User user = userService.getCurrentUser();
        String token = user.getGithubAccessToken();
        String repoFullName = project.getGithubRepoFullName();

        if (token == null || repoFullName == null) {
            log.warn("Cannot fetch insights: User not connected to GitHub or project has no linked repo");
            return GitHubApiService.GitHubInsightsDto.builder()
                    .languages(java.util.Collections.emptyMap())
                    .branches(java.util.Collections.emptyList())
                    .build();
        }

        return gitHubApiService.fetchInsights(token, repoFullName);
    }
}
