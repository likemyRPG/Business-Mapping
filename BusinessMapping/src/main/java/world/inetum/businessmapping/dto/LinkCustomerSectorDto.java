package world.inetum.businessmapping.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class LinkCustomerSectorDto {

    // Getters and Setters
    private String customerId;
    private String sectorId;

    public LinkCustomerSectorDto(String customerId, String sectorId) {
        this.customerId = customerId;
        this.sectorId = sectorId;
    }

    // toString, equals, and hashCode methods can be added for debugging and comparison purposes
    @Override
    public String toString() {
        return "Link{" +
                "customerId='" + customerId + '\'' +
                ", sectorId='" + sectorId + '\'' +
                '}';
    }

    // Implement equals() and hashCode() if necessary, especially if Link objects will be used in collections that require these methods.
}
