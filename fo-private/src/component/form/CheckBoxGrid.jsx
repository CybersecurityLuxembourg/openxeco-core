import React, { Component } from "react";
import "./CheckBoxGrid.css";
import { NotificationManager as nm } from "react-notifications";
import CheckBox from "./CheckBox.jsx";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";

export default class CheckBoxGrid extends Component {
	constructor(props) {
		super(props);

		this.state = {
			values: null,
		};
	}

	componentDidMount() {
		getRequest.call(this, "property/get_values/" + this.props.property, (data) => {
			this.setState({
				values: data.sort(),
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<div className={"CheckBoxGrid"}>
				<div className={"row"}>
					{this.state.values !== null
						? this.state.values.map((v) => (
							<div
								className={"CheckBoxGrid-grid col-xl-4 col-lg-6"}
								key={v}>
								<CheckBox
									label={v}
									value={this.props.selectedValues !== null
										? this.props.selectedValues.includes(v) : false}
									onClick={(s) => this.props.onChange(this.props.property, v, s)}
								/>
							</div>
						))
						: <Loading/>
					}
				</div>
			</div>
		);
	}
}
