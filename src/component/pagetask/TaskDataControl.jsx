import React from "react";
import "./TaskDataControl.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import Message from "../box/Message.jsx";
import Loading from "../box/Loading.jsx";

export default class TaskDataControl extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);

		this.state = {
			data_control: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.setState({
			data_control: null,
		});

		getRequest.call(this, "datacontrol/get_data_controls", (data) => {
			this.setState({
				data_control: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="TaskDataControl" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Data control</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				<div className={"row"}>
					<div className="col-md-12">
						{this.state.data_control === null
							&& <Loading
								height={250}
							/>}

						{this.state.data_control !== null
							&& this.state.data_control.length > 0
							&& this.state.data_control.map((c) => <div
								key={c.id}>
								{c.value}
							</div>)}

						{this.state.data_control !== null
							&& this.state.data_control.length === 0
							&& <Message
								text="Nothing found in the database"
								height={250}
							/>}
					</div>
				</div>
			</div>
		);
	}
}
