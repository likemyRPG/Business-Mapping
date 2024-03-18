package world.inetum.businessmapping.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import world.inetum.businessmapping.dto.Link;
import world.inetum.businessmapping.service.CustomerService;

@RestController
@RequestMapping("/api/graphs")
public class GraphController {

    private final CustomerService customerService;

    public GraphController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/customers-sectors")
    public Flux<Link> getAllCustomersAndSectors() {
        return customerService.findAllCustomerSectorRelationsAsLinks();
    }
}
