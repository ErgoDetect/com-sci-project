/** @format */

import React, { useMemo } from "react";
import { Select } from "antd";
import { DeviceSelectorProps } from "../../interface/propsType";

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
	deviceId,
	devices,
	onChange,
}) => {
	// Memoize deviceOptions to avoid recalculating on every render unless devices change
	const deviceOptions = useMemo(
		() =>
			devices.map((device) => ({
				value: device.deviceId,
				label: device.label,
			})),
		[devices]
	);

	return (
		<Select
			placeholder='Select Device'
			value={deviceId}
			onChange={onChange}
			options={deviceOptions}
			size='middle'
			style={{ width: "9rem" }}
		/>
	);
};

export default DeviceSelector;
