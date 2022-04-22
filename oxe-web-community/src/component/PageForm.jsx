import React from "react";
import "./PageForm.css";
import { NotificationManager as nm } from "react-notifications";
import FormForm from "./pageform/FormForm.jsx";
import Tab from "./tab/Tab.jsx";
import { getUrlParameter } from "../utils/url.jsx";
import { getRequest } from "../utils/request.jsx";
import Loading from "./box/Loading.jsx";
import Message from "./box/Message.jsx";

export default class PageForm extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			forms: null,
			selectedMenu: null,
		};
	}

	componentDidMount() {
		if (getUrlParameter("tab") && this.state.forms
			&& this.state.forms.map((f) => f.id.toString()).indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}

		this.getMyForms();
	}

	componentDidUpdate() {
		if (this.state.selectedMenu !== getUrlParameter("tab")
			&& this.state.forms
			&& this.state.forms.map((f) => f.id.toString()).indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	getMyForms() {
		this.setState({
			forms: null,
		}, () => {
			getRequest.call(this, "private/get_my_forms", (data) => {
				this.setState({
					forms: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	onMenuClick(m) {
		this.props.history.push("?tab=" + m);
	}

	render() {
		if (!this.state.forms) {
			return <div id="PageForm" className="page max-sized-page">
				<Loading
					height={300}
				/>
			</div>;
		}

		if (this.state.forms.length === 0) {
			return <div id="PageForm" className="page max-sized-page">
				<Message
					height={300}
					text={"No form found"}
				/>
			</div>;
		}

		return (
			<div id="PageForm" className="page max-sized-page">
				<Tab
					labels={this.state.forms.map((f) => f.name)}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.forms.map((f) => f.id.toString())}
					content={this.state.forms.map((f) => (
						<FormForm
							key={f.name}
							form={f}
						/>
					))}
				/>
			</div>
		);
	}
}
