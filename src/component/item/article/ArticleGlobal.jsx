import React from 'react';
import './ArticleGlobal.css';
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../../../utils/request';
import FormLine from '../../button/FormLine';
import Loading from '../../box/Loading';
import {validateUrlHandle} from '../../../utils/re';


export default class ArticleGlobal extends React.Component {

	constructor(props){
		super(props);

		this.refresh = this.refresh.bind(this);
		this.saveArticleValue = this.saveArticleValue.bind(this);

		this.state = {
			article: null,
            articleEnums: null
		}
	}

	componentDidMount() {
		this.refresh();
	}

    refresh() {
        getRequest.call(this, "article/get_article/" + this.props.id, data => {
            this.setState({
                article: data,
            });

            getRequest.call(this, "article/get_article_enums", data => {
                this.setState({
                    articleEnums: data,
                });
            }, response => {
                nm.warning(response.statusText);
            }, error => {
                nm.error(error.message);
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
    }

    saveArticleValue(prop, value) {
        if (this.state.article[prop] !== value) {
            let params = {
                id: this.props.id,
                [prop]: value,
            }

            postRequest.call(this, "article/update_article", params, response => {
                let article = Object.assign({}, this.state.article);

                article[prop] = value;
                this.setState({article: article});
                nm.info("The property has been updated");
            }, response => {
                this.refresh();
                nm.warning(response.statusText);
            }, error => {
                this.refresh();
                nm.error(error.message);
            });
        }
    }

	render() {
		if (this.state.article === null || this.state.articleEnums === null)
        	return <Loading height={300}/>;

		return (
			<div className={"row"}>
                <div className="col-md-12">
                    <h2>Global</h2>
                </div>
				<div className="col-md-12">
                    <FormLine
                        label={"ID"}
                        value={this.state.article.id}
                        disabled={true}
                    />
                    <FormLine
                        type={"image"}
                        label={"Cover image"}
                        value={this.state.article.image}
                        onChange={v => this.saveArticleValue("image", v)}
                        height={200}
                    />
                    <FormLine
                        label={"Title"}
                        value={this.state.article.title}
                        onBlur={v => this.saveArticleValue("title", v)}
                    />
                    <FormLine
                        label={"Type"}
                        type={"select"}
                        value={this.state.article.type}
                        options={this.state.articleEnums === null || 
                            typeof this.state.articleEnums.type === "undefined" ? [] :
                            this.state.articleEnums.type.map(o => { return {label: o, value: o}})}
                        onChange={v => this.saveArticleValue("type", v)}
                    />
                    <FormLine
                        label={"Handle"}
                        value={this.state.article.handle}
                        onBlur={v => this.saveArticleValue("handle", v)}
                        format={validateUrlHandle}
                    />
                    <FormLine
                        type={"textarea"}
                        label={"Abstract"}
                        value={this.state.article.abstract}
                        onBlur={v => this.saveArticleValue("abstract", v)}
                    />
                    <FormLine
                        type={"date"}
                        label={"Publication date"}
                        value={this.state.article.publication_date}
                        onBlur={v => this.saveArticleValue("publication_date", v)}
                    />
                    <FormLine
                        label={"Status"}
                        type={"select"}
                        value={this.state.article.status}
                        options={this.state.articleEnums === null || 
                            typeof this.state.articleEnums.status === "undefined" ? [] :
                            this.state.articleEnums.status.map(o => { return {label: o, value: o}})}
                        onChange={v => this.saveArticleValue("status", v)}
                    />
                    <FormLine
                        label={"Media"}
                        type={"select"}
                        value={this.state.article.media}
                        options={this.state.articleEnums === null || 
                            typeof this.state.articleEnums.media === "undefined" ? [] :
                            this.state.articleEnums.media.map(o => { return {label: o, value: o}})}
                        onChange={v => this.saveArticleValue("media", v)}
                    />
                </div>

                {this.state.article.type === "EVENT" ?
                        <div className="col-md-12">
                            <h2>Additional event fields</h2>
                        </div>
                : ""}
                {this.state.article.type === "EVENT" ?
                    <div className="col-md-12">
                        <FormLine
                            label={"Start date"}
                            type={"datetime-local"}
                            value={this.state.article.start_date}
                            onChange={v => this.saveArticleValue("start_date", v)}
                        />
                        <FormLine
                            label={"End date"}
                            type={"datetime-local"}
                            value={this.state.article.end_date}
                            onChange={v => this.saveArticleValue("end_date", v)}
                        />
                    </div>
                : ""}
			</div>
		);
	}
}