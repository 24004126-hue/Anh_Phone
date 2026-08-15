import { useEffect, useState } from "react";
import { Row, Col, Form } from "react-bootstrap";

import brandApi from "../../api/brandApi";
import categoryApi from "../../api/categoryApi";

function ProductFilter({ value, onChange }) {

    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const brandRes = await brandApi.getAll();
            const categoryRes = await categoryApi.getAll();

            setBrands(brandRes.data);
            setCategories(categoryRes.data);
        }
        catch (err) {
            console.log(err);
        }
    }

    function update(field, data) {
        onChange({
            ...value,
            [field]: data
        });
    }

    return (
        <Row className="mb-4">

            <Col md={3}>
                <Form.Select
                    value={value.brandId}
                    onChange={(e) => update("brandId", e.target.value)}
                >
                    <option value="">Tất cả hãng</option>

                    {brands.map(item => (
                        <option
                            key={item.brandId}
                            value={item.brandId}
                        >
                            {item.brandName}
                        </option>
                    ))}

                </Form.Select>
            </Col>

            <Col md={3}>
                <Form.Select
                    value={value.categoryId}
                    onChange={(e) => update("categoryId", e.target.value)}
                >
                    <option value="">Tất cả danh mục</option>

                    {categories.map(item => (
                        <option
                            key={item.categoryId}
                            value={item.categoryId}
                        >
                            {item.categoryName}
                        </option>
                    ))}

                </Form.Select>
            </Col>

            <Col md={2}>
                <Form.Control
                    type="number"
                    placeholder="Giá từ"
                    value={value.minPrice}
                    onChange={(e) => update("minPrice", e.target.value)}
                />
            </Col>

            <Col md={2}>
                <Form.Control
                    type="number"
                    placeholder="Giá đến"
                    value={value.maxPrice}
                    onChange={(e) => update("maxPrice", e.target.value)}
                />
            </Col>

            <Col md={2}>
                <Form.Select
                    value={value.sortBy}
                    onChange={(e) => update("sortBy", e.target.value)}
                >
                    <option value="">Mặc định</option>
                    <option value="price_asc">Giá tăng</option>
                    <option value="price_desc">Giá giảm</option>
                    <option value="name">Tên A-Z</option>
                    <option value="newest">Mới nhất</option>
                </Form.Select>
            </Col>

        </Row>
    );
}

export default ProductFilter;