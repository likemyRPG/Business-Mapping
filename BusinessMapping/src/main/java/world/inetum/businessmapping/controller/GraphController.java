package world.inetum.businessmapping.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import world.inetum.businessmapping.dto.LinkCustomerSectorDto;
import world.inetum.businessmapping.dto.LinkProjectCustomerDto;
import world.inetum.businessmapping.service.CustomerService;
import world.inetum.businessmapping.service.ProjectService;

@RestController
@RequestMapping("/api/graphs")
public class GraphController {

    private final CustomerService customerService;
    private final ProjectService projectService;

    public GraphController(CustomerService customerService, ProjectService projectService) {
        this.customerService = customerService;
        this.projectService = projectService;
    }

    @GetMapping("/customers-sectors")
    public Flux<LinkCustomerSectorDto> getAllCustomersAndSectors() {
        return customerService.findAllCustomerSectorRelationsAsLinks();
    }

    @GetMapping("/customers-projects")
    public Flux<LinkProjectCustomerDto> getAllCustomersAndProjects() {
        return projectService.findAllCustomerProjectRelations();
    }
}
