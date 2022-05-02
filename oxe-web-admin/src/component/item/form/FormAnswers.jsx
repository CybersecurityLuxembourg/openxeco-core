import React, { Component } from "react";
import "./FormAnswers.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../../utils/request.jsx";
import { dictToURI } from "../../../utils/url.jsx";
import Loading from "../../box/Loading.jsx";
import Message from "../../box/Message.jsx";
import FormAnswer from "../FormAnswer.jsx";

export default class FormAnswers extends Component {
	constructor(props) {
		super(props);

		this.state = {
			questions: null,
			answers: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.form !== this.props.form) {
			this.refresh();
		}
	}

	refresh() {
		this.fetchQuestions();
		this.fetchAnswers();
	}

	fetchQuestions() {
		if (this.props.form) {
			const params = dictToURI({
				form_id: this.props.form.id,
			});

			getRequest.call(this, "form/get_form_questions?" + params, (data) => {
				this.setState({
					questions: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	fetchAnswers() {
		if (this.props.form) {
			const params = dictToURI({
				form_id: this.props.form.id,
			});

			getRequest.call(this, "form/get_form_answers?" + params, (data) => {
				this.setState({
					answers: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	getUsers() {
		if (this.state.answers) {
			return [...new Set(
				this.state.answers.map((a) => (a.user_id)),
			)];
		}

		return null;
	}

	getUserAnswers(u) {
		if (this.state.answers) {
			return this.state.answers
				.filter((a) => a.user_id === u);
		}

		return null;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="FormAnswers" className={"row"}>
				<div className="col-md-8">
					<h2>Answers</h2>
				</div>

				<div className="col-md-12">
					{this.getUsers()
						? this.getUsers().map((u) => (
							<FormAnswer
								key={u}
								user={u}
								form={this.props.form}
								questions={this.state.questions}
								answers={this.getUserAnswers(u)}
							/>
						))
						: <Loading
							height={300}
						/>
					}

					{this.getUsers()
						&& this.getUsers().length === 0
						&& <Message
							text={"No answer found"}
						/>
					}
				</div>
			</div>
		);
	}
}
