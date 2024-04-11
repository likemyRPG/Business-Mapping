package world.inetum.businessmapping.controller;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.inetum.businessmapping.entity.CustomerEntity;
import world.inetum.businessmapping.service.CustomerService;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    @Autowired
    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @Operation(summary = "Get all customers", description = "Retrieve a list of all customers", tags = {"customers"})
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    Flux<CustomerEntity> getAllCustomers() {
        return customerService.findAll();
    }

    @Operation(summary = "Get customer by name", description = "Retrieve a customer by name", tags = {"customers"})
    @GetMapping(value = "/name/{name}", produces = MediaType.APPLICATION_JSON_VALUE)
    Mono<CustomerEntity> getCustomerByName(@PathVariable String name) {
        return customerService.findByName(name);
    }

    @Operation(summary = "Get customer by id", description = "Retrieve a customer by id", tags = {"customers"})
    @GetMapping(value = "/id/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    Mono<CustomerEntity> getCustomerById(@PathVariable String id) {
        return customerService.findById(id);
    }

    @Operation(summary = "Get customers by sector", description = "Retrieve a list of customers by sector", tags = {"customers"})
    @GetMapping(value = "/sector/{sector}", produces = MediaType.APPLICATION_JSON_VALUE)
    Flux<CustomerEntity> getCustomersBySector(@PathVariable String sector) {
        return customerService.findBySector(sector);
    }
}

