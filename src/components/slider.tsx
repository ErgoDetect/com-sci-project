/** @format */

import React, { useEffect, useState, useCallback } from 'react';
import { Col, InputNumber, Row, Slider } from 'antd';
import type { InputNumberProps } from 'antd';
import { InputProps } from '../interface/propsType';

const CustomSlider: React.FC<InputProps> = ({ text, value, onChange }) => {
  const [inputValue, setInputValue] = useState<number>(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = useCallback<InputNumberProps['onChange']>(
    (newValue) => {
      const numberValue = newValue as number;
      setInputValue(numberValue);
      onChange(numberValue);
    },
    [onChange],
  );

  return (
    <Row align="middle" gutter={16}>
      <Col span={3}>{text}</Col>
      <Col span={10}>
        <Slider
          min={0.1}
          max={1}
          onChange={handleChange}
          value={typeof inputValue === 'number' ? inputValue : 0.1}
          step={0.05}
        />
      </Col>
      <Col>
        <InputNumber
          min={0.1}
          max={1}
          style={{ margin: '0 16px', width: '60px' }}
          value={inputValue}
          onChange={handleChange}
          step={0.05}
        />
      </Col>
    </Row>
  );
};

export default CustomSlider;
