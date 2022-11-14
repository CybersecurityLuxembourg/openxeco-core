import React from "react";
import "./FormForm.css";
import dompurify from "dompurify";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../utils/request.jsx";
import Message from "../box/Message.jsx";
import Loading from "../box/Loading.jsx";
import { dictToURI } from "../../utils/url.jsx";
import FormLine from "../form/FormLine.jsx";

export default class FormForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			questions: null,
			answers: null,
		};
	}

	componentDidMount() {
		if (this.props.form) {
			this.refresh();
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.form !== prevProps.form) {
			this.refresh();
		}
	}

	refresh() {
		this.getQuestions();
		this.getAnswers();
	}

	getQuestions() {
		this.setState({
			questions: null,
		}, () => {
			const params = {
				form_id: this.props.form.id,
			};

			getRequest.call(this, "private/get_my_form_questions?" + dictToURI(params), (data) => {
				this.setState({
					questions: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getAnswers() {
		const params = {
			form_id: this.props.form.id,
		};

		getRequest.call(this, "private/get_my_form_answers?" + dictToURI(params), (data) => {
			this.setState({
				answers: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	updateAnswer(id, answer, value) {
		if (answer) {
			if (value && value.replace(/<\/?[^>]+(>|$)/g, "").replace(/(\r\n|\n|\r)/gm, "").length === 0) {
				const params = {
					id: answer.id,
				};

				postRequest.call(this, "private/delete_my_form_answer", params, () => {
					nm.info("The answer has been deleted");
					this.getAnswers();
				}, (response) => {
					nm.warning(response.statusText);
				}, (error) => {
					nm.error(error.message);
				});
			} else {
				const params = {
					id: answer.id,
					value,
				};

				postRequest.call(this, "private/update_my_form_answer", params, () => {
					nm.info("The answer has been updated");
					this.getAnswers();
				}, (response) => {
					nm.warning(response.statusText);
				}, (error) => {
					nm.error(error.message);
				});
			}
		} else if (value && value.replace(/<\/?[^>]+(>|$)/g, "").replace(/(\r\n|\n|\r)/gm, "").length > 0) {
			const params = {
				form_question_id: id,
				value,
			};

			postRequest.call(this, "private/add_my_form_answer", params, () => {
				nm.info("The answer has been added");
				this.getAnswers();
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	getAnswer(q) {
		if (!this.state.answers) {
			return null;
		}

		const answers = this.state.answers.filter((a) => a.form_question_id === q.id);

		if (answers.length === 0) {
			return null;
		}

		return answers[0];
	}

	getQuestionAndAnswer(q) {
		return <div className={"row"}>
			<div className="col-md-12">
				<div dangerouslySetInnerHTML={{
					__html:
					dompurify.sanitize(q.value),
				}} />
			</div>

			{q.type === "TEXT"
				&& <div className="col-md-12 row-spaced">
					<FormLine
						label={""}
						fullWidth={true}
						value={this.getAnswer(q) ? this.getAnswer(q).value : ""}
						onBlur={(v) => this.updateAnswer(q.id, this.getAnswer(q), v)}
					/>
				</div>
			}

			{q.type === "TEXTAREA"
				&& <div className="col-md-12 row-spaced">
					<FormLine
						type={"textarea"}
						label={""}
						fullWidth={true}
						value={this.getAnswer(q) ? this.getAnswer(q).value : ""}
						onBlur={(v) => this.updateAnswer(q.id, this.getAnswer(q), v)}
					/>
				</div>
			}

			{q.type === "CHECKBOX"
				&& <div className="col-md-12 row-spaced">
					<FormLine
						label={""}
						innerLabel={this.getAnswer(q) && typeof this.getAnswer(q).value !== "undefined"
							? undefined : "No answer provided yet"}
						fullWidth={true}
						type={"checkbox"}
						value={this.getAnswer(q) ? this.getAnswer(q).value === "TRUE" : false}
						onChange={(v) => this.updateAnswer(q.id, this.getAnswer(q), v ? "TRUE" : "FALSE")}
						background={"kkkk"}
					/>
				</div>
			}

			{q.type === "OPTIONS"
				&& <div className="col-md-12 row-spaced">
					{q.options
						? <FormLine
							type={"multiselect"}
							fullWidth={true}
							value={this.getAnswer(q) && this.getAnswer(q).value ? this.getAnswer(q).value.split("|") : []}
							options={q.options.split("|").map((o) => ({ label: o, value: o }))}
							onChange={(v) => this.updateAnswer(q.id, this.getAnswer(q), v.join("|"))}
						/>
						: <div className="col-md-12 row-spaced">
							<Message
								height={100}
								text={"No option found for this question"}
							/>
						</div>
					}
				</div>
			}

			{q.type === "SELECT"
				&& <div className="col-md-12 row-spaced">
					{q.options
						? <FormLine
							type={"select"}
							fullWidth={true}
							value={this.getAnswer(q) ? this.getAnswer(q).value : false}
							options={q.options.split("|").map((o) => ({ label: o, value: o }))}
							onChange={(v) => this.updateAnswer(q.id, this.getAnswer(q), v)}
						/>
						: <div className="col-md-12 row-spaced">
							<Message
								height={100}
								text={"No option found for this question"}
							/>
						</div>
					}
				</div>
			}
		</div>;
	}

	render() {
		if (!this.props.form) {
			return <Loading
				height={300}
			/>;
		}

		return (
			<div id="FormForm" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>{this.props.form.name}</h1>
					</div>
				</div>

				{this.props.form.description
					&& <div className={"row row-spaced"}>
						<div className="col-md-12">
							<div dangerouslySetInnerHTML={{
								__html:
								dompurify.sanitize(this.props.form.description),
							}} />
						</div>
					</div>
				}

				{this.state.questions
					? <div className={"row"}>
						<div className="col-md-12">
							{this.state.questions
								.sort((a, b) => a.position - b.position)
								.map((q) => (
									this.getQuestionAndAnswer(q)
								))}
						</div>
					</div>
					: <div className={"row"}>
						<div className="col-md-12">
							<Loading
								height={300}
							/>
						</div>
					</div>
				}
			</div>
		);
	}
}
