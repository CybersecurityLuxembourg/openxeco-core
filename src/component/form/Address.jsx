import React from "react";
import "./Address.css";
import FormLine from "./FormLine.jsx";
import { validateNotNull } from "../../utils/re.jsx";

export default class Address extends React.Component {
	constructor(props) {
		super(props);

		this.onChange = this.onChange.bind(this);

		this.state = {
			showAddress2: false,
		};
	}

	onChange(field, value) {
		if (this.props.onChange !== undefined) this.props.onChange(field, value);
	}

	render() {
		return (
			<div className="row">
				<div className="col-md-12">
					<div className={"row"}>
						<div className={"col-md-6"}>
							<div className={"FormLine-label"}>
								Number - Street
							</div>
						</div>
						<div className={"col-md-2"}>
							<input
								value={this.props.info.number}
								onChange={(v) => this.onChange("number", v.target.value)}
							/>
						</div>
						<div className={"col-md-4"}>
							<input
								className={validateNotNull(this.props.info.address_1)
									? "FormLine-right-format" : "FormLine-wrong-format"}
								value={this.props.info.address_1}
								onChange={(v) => this.onChange("address_1", v.target.value)}
							/>
						</div>
					</div>
					{this.state.showAddress2 || (this.props.info.address_2 !== null
						&& this.props.info.address_2 !== undefined)
						? <FormLine
							label={"House, Entrance, appartment... (optional)"}
							value={this.props.info.address_2}
							onChange={(v) => this.onChange("address_2", v)}
						/>
						:						<div className={"row"}>
							<div className={"col-md-6"}>
							</div>
							<div className={"col-md-6"}>
								<button
									className="link-button"
									onClick={() => this.setState({ showAddress2: true })}
								>
									Add house, entrance, appartment information
								</button>
							</div>
						</div>
					}
					<div className={"row"}>
						<div className={"col-md-6"}>
							<div className={"FormLine-label"}>
								ZIP/Postal code - City
							</div>
						</div>
						<div className={"col-md-2"}>
							<input
								value={this.props.info.postal_code}
								onChange={(v) => this.onChange("postal_code", v.target.value)}
							/>
						</div>
						<div className={"col-md-4"}>
							<input
								className={validateNotNull(this.props.info.city)
									? "FormLine-right-format" : "FormLine-wrong-format"}
								value={this.props.info.city}
								onChange={(v) => this.onChange("city", v.target.value)}
							/>
						</div>
					</div>
					<FormLine
						label={"Country"}
						type={"country"}
						value={this.props.info.country}
						onChange={(v) => this.onChange("country", v)}
						format={validateNotNull}
					/>
					<FormLine
						label={"State, Canton"}
						type={"region"}
						country={this.props.info.country}
						value={this.props.info.administrative_area}
						onChange={(v) => this.onChange("administrative_area", v)}
					/>
				</div>
			</div>
		);
	}
}
