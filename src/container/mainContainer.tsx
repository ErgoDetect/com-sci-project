/** @format */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { LaptopOutlined } from "@ant-design/icons";
import { Layout, Menu, Tabs, Checkbox, Button, theme } from "antd";
import type { MenuProps, TabsProps } from "antd";

import CustomSlider from "../components/slider";
import PositionTab from "../components/positionTab";
import { PositionData, ContainerProps } from "../interface/propsType";

import "../styles/styles.css";

const { Header, Content, Footer, Sider } = Layout;

const headerMenu: MenuProps["items"] = [
	{ key: "1", label: "Header 1" },
	{ key: "2", label: "Header 2" },
];

const Container: React.FC<ContainerProps> = ({ children, data }) => {
	const positionData = data as PositionData;

	const [sliderValues, setSliderValues] = useState({
		headRotationX: 0.1,
		headRotationY: 0.1,
		headRotationZ: 0.1,
	});

	const [conditionPositionData, setConditionPositionData] = useState<
		PositionData | undefined
	>(undefined);

	const setPositionData = useCallback(() => {
		setConditionPositionData(positionData);
	}, [positionData]);

	useEffect(() => {
		console.log(conditionPositionData);
	}, [conditionPositionData]);

	const handleSliderChange = useCallback((key: string, value: number) => {
		setSliderValues((prevValues) => ({
			...prevValues,
			[key]: value,
		}));
	}, []);

	const sensitiveMenu: MenuProps["items"] = useMemo(
		() => [
			{
				key: "1",
				icon: (
					<Checkbox>
						<LaptopOutlined />
					</Checkbox>
				),
				label: "Head pose rotation angle",
				children: [
					{
						key: "11",
						label: (
							<CustomSlider
								value={sliderValues.headRotationX}
								onChange={(value: number) =>
									handleSliderChange("headRotationX", value)
								}
								text='x :'
							/>
						),
					},
					{
						key: "12",
						label: (
							<CustomSlider
								value={sliderValues.headRotationY}
								onChange={(value: number) =>
									handleSliderChange("headRotationY", value)
								}
								text='y :'
							/>
						),
					},
					{
						key: "13",
						label: (
							<CustomSlider
								value={sliderValues.headRotationZ}
								onChange={(value: number) =>
									handleSliderChange("headRotationZ", value)
								}
								text='z :'
							/>
						),
					},
				],
			},
			{ key: "2", icon: <LaptopOutlined />, label: "Option 2" },
		],
		[sliderValues, handleSliderChange]
	);

	const rightTab: TabsProps["items"] = useMemo(
		() => [
			{
				key: "rightTab1",
				label: "Sensitive",
				children: (
					<Menu
						mode='inline'
						defaultSelectedKeys={["1"]}
						defaultOpenKeys={["sub1"]}
						style={{ height: "100%" }}
						items={sensitiveMenu}
					/>
				),
			},
			{
				key: "rightTab2",
				label: "Output",
				children: "Content of Tab Pane 2",
			},
			{
				key: "rightTab3",
				label: "Position",
				children: <PositionTab data={data} />,
			},
		],
		[sensitiveMenu, data]
	);

	const {
		token: { colorBgContainer },
	} = theme.useToken();

	useEffect(() => {
		if (conditionPositionData && positionData) {
			const checkPositionChange = () => {
				if (
					Math.abs(
						positionData.headPosition.x - conditionPositionData.headPosition.x
					) > sliderValues.headRotationX
				) {
					console.log("Position changed");
				}
			};
			checkPositionChange();
		}
	}, [conditionPositionData, positionData, sliderValues]);

	return (
		<Layout className='Layout'>
			<Header
				style={{ display: "flex", alignItems: "center" }}
				className='Header'
			>
				<h2 style={{ padding: "5px" }}>Header</h2>
				<Menu
					theme='dark'
					mode='horizontal'
					defaultSelectedKeys={["2"]}
					items={headerMenu}
					style={{ flex: 1, minWidth: 0 }}
				/>
			</Header>
			<Content className='Content'>
				<Layout style={{ height: "100%" }}>
					<Content style={{ padding: "10px" }}>
						<Button onClick={setPositionData}>Set</Button>
						{children}
					</Content>
					<Sider width={300} style={{ background: colorBgContainer }}>
						<Tabs
							style={{ padding: "10px" }}
							defaultActiveKey='1'
							items={rightTab}
						/>
					</Sider>
				</Layout>
			</Content>
			<Footer className='Footer'>Footer</Footer>
		</Layout>
	);
};

export default Container;
