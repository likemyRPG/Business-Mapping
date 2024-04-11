package world.inetum.businessmapping.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class LinkProjectCustomerDto {

    // Getters and Setters
    private String customerId;
    private String projectId;

    public LinkProjectCustomerDto(String projectId, String customerId) {
        this.customerId = customerId;
        this.projectId = projectId;
    }

    @Override
    public String toString() {
        return "Link{" +
                "customerId='" + customerId + '\'' +
                ", sectorId='" + projectId + '\'' +
                '}';
    }
}
