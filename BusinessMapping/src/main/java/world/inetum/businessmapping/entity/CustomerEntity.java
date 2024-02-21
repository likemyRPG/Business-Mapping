package world.inetum.businessmapping.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

import java.util.UUID;

@Data
@Node("Customer")
@NoArgsConstructor
public class CustomerEntity {

    @Id
    private String uuid;

    @Property("name")
    private String name;

    @Property("size")
    private String size;

    @Property("location")
    private String location;

    @Property("numberOfEmployees")
    private long numberOfEmployees;

    @Property("industry")
    private String industry;

    @Property("revenue")
    private long revenue;
}
