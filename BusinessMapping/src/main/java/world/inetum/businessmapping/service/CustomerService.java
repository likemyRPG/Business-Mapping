package world.inetum.businessmapping.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.inetum.businessmapping.dto.LinkCustomerSectorDto;
import world.inetum.businessmapping.entity.CustomerEntity;
import world.inetum.businessmapping.repository.CustomerRepository;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Autowired
    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Flux<CustomerEntity> findAll() {
        return customerRepository.findAll();
    }

    public Mono<CustomerEntity> findByName(String name) {
        return customerRepository.findOneByName(name);
    }

    public Mono<CustomerEntity> findById(String id) {
        return customerRepository.findById(id);
    }

    public Flux<CustomerEntity> findBySector(String sector) {
        return customerRepository.findAllBySector(sector);
    }

    public Flux<LinkCustomerSectorDto> findAllCustomerSectorRelationsAsLinks() {
        return customerRepository.findAllCustomerSectorRelations()
                .map(dto -> new LinkCustomerSectorDto(dto.getCustomerId(), dto.getSectorId()));
    }
}