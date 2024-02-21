package world.inetum.businessmapping.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.inetum.businessmapping.dto.CustomerDto;
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

    public Mono<CustomerEntity> create(CustomerDto customerDto) {
        CustomerEntity customer = new CustomerEntity();
        customer.setName(customerDto.getName());
        customer.setSize(customerDto.getSize());
        customer.setLocation(customerDto.getLocation());
        customer.setNumberOfEmployees(customerDto.getNumberOfEmployees());
        customer.setIndustry(customerDto.getIndustry());
        customer.setRevenue(customerDto.getRevenue());
        return customerRepository.save(customer);
    }


    public Mono<Void> delete(String id) {
        return customerRepository.deleteById(id);
    }

    public Flux<CustomerEntity> findBySector(String sector) {
        return customerRepository.findAllBySector(sector);
    }
}
