package world.inetum.businessmapping.service;

import org.springframework.beans.factory.annotation.Autowired;
import reactor.core.publisher.Mono;
import world.inetum.businessmapping.entity.CustomerEntity;
import world.inetum.businessmapping.repository.ProjectRepository;

public class ProjectService {

    private final ProjectRepository projectRepository;

    @Autowired
    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }
}
