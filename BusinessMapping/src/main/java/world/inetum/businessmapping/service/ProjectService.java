package world.inetum.businessmapping.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import world.inetum.businessmapping.dto.LinkProjectCustomerDto;
import world.inetum.businessmapping.entity.ProjectEntity;
import world.inetum.businessmapping.repository.ProjectRepository;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Autowired
    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public Flux<ProjectEntity> findAll() {
        return projectRepository.findAll();
    }

    public Flux<LinkProjectCustomerDto> findAllCustomerProjectRelations() {
        return projectRepository.findAllCustomerProjectRelations()
                .map(dto -> new LinkProjectCustomerDto(dto.getCustomerId(), dto.getProjectId()));
    }
}
