package world.inetum.businessmapping.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CustomerDto {
//    private String uuid; // Keep for updates where UUID is provided
    private String name;
    private String size;
    private String location;
    private long numberOfEmployees;
    private String industry;
    private long revenue;

    public CustomerDto(String name, String size, String location, long numberOfEmployees, String industry, long revenue) {
        this.name = name;
        this.size = size;
        this.location = location;
        this.numberOfEmployees = numberOfEmployees;
        this.industry = industry;
        this.revenue = revenue;
    }
}
