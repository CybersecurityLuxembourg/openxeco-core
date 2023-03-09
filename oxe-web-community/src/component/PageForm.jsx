import React from "react";
import "./PageForm.css";
import { NotificationManager as nm } from "react-notifications";
import FormList from "./pageform/FormList.jsx";
import FormForm from "./pageform/FormForm.jsx";
import Tab from "./tab/Tab.jsx";
import { getUrlParameter } from "../utils/url.jsx";
import { getRequest } from "../utils/request.jsx";
import Loading from "./box/Loading.jsx";
import DialogHint from "./dialog/DialogHint.jsx";

export default class PageForm extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			forms: null,
			selectedMenu: null,
			inc: 0,
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
		console.log(this.state.selectedMenu, getUrlParameter("tab"));
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
		this.setState({ selectedMenu: m });
	}

	render() {
		if (!this.state.forms) {
			return <div id="PageForm" className="page max-sized-page">
				<Loading
					height={300}
				/>
			</div>;
		}

		return (
			<div id="PageForm" className="page max-sized-page">
				<h1>
					Forms&nbsp;

					<DialogHint
						small={true}
						content={
							<div className="row">
								<div className="col-md-12">
									<h2>What are the forms?</h2>
								</div>
							</div>
						}
					/>
				</h1>

				<Tab
					labels={["Available forms"].concat(this.state.forms.map((f) => f.name))}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={(m) => this.onMenuClick(m)}
					keys={["forms"].concat(this.state.forms.map((f) => f.id.toString()))}
					content={[
						<FormList
							key="forms"
							forms={this.state.forms}
							keys={this.state.forms.map((f) => f.id.toString())}
							selectForm={(m) => this.onMenuClick(m)}
						/>,
					].concat(this.state.forms.map((f) => (
						<FormForm
							key={f.name}
							form={f}
						/>
					)))}
				/>
			</div>
		);
	}
}
