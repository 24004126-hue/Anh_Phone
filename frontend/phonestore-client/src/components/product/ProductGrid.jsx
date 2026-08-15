import { Row, Col } from "react-bootstrap";
import ProductCard from "./ProductCard";

function ProductGrid({ products }) {

    if (!products || products.length === 0) {
        return (
            <div className="text-center mt-5">
                <h4>Không tìm thấy sản phẩm.</h4>
            </div>
        );
    }

    return (
        <Row>
            {products.map(product => (
                <Col
                    lg={3}
                    md={4}
                    sm={6}
                    key={product.productId}
                    className="mb-4"
                >
                    <ProductCard product={product} />
                </Col>
            ))}
        </Row>
    );
}

export default ProductGrid;