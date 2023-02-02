# pylint: disable=unused-import
# flake8: noqa: F401
from resource.account.change_password import ChangePassword
from resource.account.create_account import CreateAccount
from resource.account.forgot_password import ForgotPassword
from resource.account.login import Login
from resource.account.logout import Logout
from resource.account.refresh import Refresh
from resource.account.reset_password import ResetPassword
from resource.account.unsubscribe import Unsubscribe
from resource.analytics.get_ecosystem_activity import GetEcosystemActivity
from resource.article.copy_article_version import CopyArticleVersion
from resource.article.get_articles import GetArticles
from resource.article.get_article import GetArticle
from resource.article.get_article_tags import GetArticleTags
from resource.article.get_article_versions import GetArticleVersions
from resource.article.get_article_version_content import GetArticleVersionContent
from resource.article.add_article import AddArticle
from resource.article.add_article_version import AddArticleVersion
from resource.article.add_entity_tag import AddEntityTag
from resource.article.add_taxonomy_tag import AddTaxonomyTag
from resource.article.delete_article import DeleteArticle
from resource.article.delete_article_version import DeleteArticleVersion
from resource.article.delete_entity_tag import DeleteEntityTag
from resource.article.delete_taxonomy_tag import DeleteTaxonomyTag
from resource.article.set_article_version_as_main import SetArticleVersionAsMain
from resource.article.update_article import UpdateArticle
from resource.article.update_article_version import UpdateArticleVersion
from resource.article.update_article_version_content import UpdateArticleVersionContent
from resource.address.get_address import GetAddress
from resource.address.get_all_addresses import GetAllAddresses
from resource.address.add_address import AddAddress
from resource.address.delete_address import DeleteAddress
from resource.address.update_address import UpdateAddress
from resource.notification.get_notifications import GetNotifications
from resource.campaign.add_campaign import AddCampaign
from resource.campaign.add_campaign_addresses import AddCampaignAddresses
from resource.campaign.add_campaign_template import AddCampaignTemplate
from resource.campaign.delete_campaign import DeleteCampaign
from resource.campaign.delete_campaign_addresses import DeleteCampaignAddresses
from resource.campaign.delete_campaign_template import DeleteCampaignTemplate
from resource.campaign.get_campaign import GetCampaign
from resource.campaign.get_campaign_addresses import GetCampaignAddresses
from resource.campaign.get_campaign_template import GetCampaignTemplate
from resource.campaign.get_campaign_templates import GetCampaignTemplates
from resource.campaign.get_campaigns import GetCampaigns
from resource.campaign.update_campaign import UpdateCampaign
from resource.campaign.update_campaign_template import UpdateCampaignTemplate
from resource.campaign.send_campaign import SendCampaign
from resource.campaign.send_campaign_draft import SendCampaignDraft
from resource.entity.extract_entities import ExtractEntities
from resource.entity.get_entities import GetEntities
from resource.entity.get_entity import GetEntity
from resource.entity.get_entity_addresses import GetEntityAddresses
from resource.entity.get_entity_contacts import GetEntityContacts
from resource.entity.get_entity_taxonomy import GetEntityTaxonomy
from resource.entity.get_entity_users import GetEntityUsers
from resource.entity.get_entity_workforces import GetEntityWorkforces
from resource.entity.update_entity import UpdateEntity
from resource.entity.add_entity import AddEntity
from resource.entity.delete_entity import DeleteEntity
from resource.contact.add_contact import AddContact
from resource.contact.delete_contact import DeleteContact
from resource.contact.get_contact_enums import GetContactEnums
from resource.contact.update_contact import UpdateContact
from resource.cron.run_entity_website_check import RunEntityWebsiteCheck
from resource.cron.run_database_compliance import RunDatabaseCompliance
from resource.datacontrol.get_data_controls import GetDataControls
from resource.datacontrol.delete_data_control import DeleteDataControl
from resource.form.add_form import AddForm
from resource.form.add_form_answer import AddFormAnswer
from resource.form.add_form_question import AddFormQuestion
from resource.form.delete_form import DeleteForm
from resource.form.delete_form_question import DeleteFormQuestion
from resource.form.extract_form import ExtractForm
from resource.form.get_form_enums import GetFormEnums
from resource.form.get_form_answers import GetFormAnswers
from resource.form.get_form_question_enums import GetFormQuestionEnums
from resource.form.get_form_questions import GetFormQuestions
from resource.form.get_forms import GetForms
from resource.form.update_form import UpdateForm
from resource.form.update_form_answer import UpdateFormAnswer
from resource.form.update_form_question import UpdateFormQuestion
from resource.form.update_form_question_order import UpdateFormQuestionOrder
from resource.healthz import Healthz
from resource.log.get_logs import GetLogs
from resource.log.get_update_article_version_logs import GetUpdateArticleVersionLogs
from resource.mail.delete_template import DeleteTemplate
from resource.mail.get_mail_addresses import GetMailAddresses
from resource.mail.get_template import GetTemplate
from resource.mail.update_template import UpdateTemplate
from resource.mail.send_mail import SendMail
from resource.media.add_image import AddImage
from resource.media.add_document import AddDocument
from resource.media.delete_image import DeleteImage
from resource.media.delete_document import DeleteDocument
from resource.media.update_image import UpdateImage
from resource.media.update_document import UpdateDocument
from resource.media.get_images import GetImages
from resource.media.get_image import GetImage
from resource.media.get_document import GetDocument
from resource.network.add_network_node import AddNetworkNode
from resource.network.delete_network_node import DeleteNetworkNode
from resource.network.get_network_nodes import GetNetworkNodes
from resource.network.import_article import ImportArticle
from resource.network.import_entity import ImportEntity
from resource.network.import_taxonomy import ImportTaxonomy
from resource.note.add_note import AddNote
from resource.note.delete_note import DeleteNote
from resource.note.get_notes import GetNotes
from resource.note.update_note import UpdateNote
from resource.private.add_my_article import AddMyArticle
from resource.private.add_my_form_answer import AddMyFormAnswer
from resource.private.add_request import AddRequest
from resource.private.delete_my_article import DeleteMyArticle
from resource.private.delete_my_form_answer import DeleteMyFormAnswer
from resource.private.delete_my_request import DeleteMyRequest
from resource.private.delete_my_user import DeleteMyUser
from resource.private.generate_my_user_handle import GenerateMyUserHandle
from resource.private.get_my_form_questions import GetMyFormQuestions
from resource.private.get_my_forms import GetMyForms
from resource.private.get_my_article import GetMyArticle
from resource.private.get_my_article_content import GetMyArticleContent
from resource.private.get_my_articles import GetMyArticles
from resource.private.get_my_entities import GetMyEntities
from resource.private.get_my_entity_addresses import GetMyEntityAddresses
from resource.private.get_my_entity_collaborators import GetMyEntityCollaborators
from resource.private.get_my_entity_requests import GetMyEntityRequests
from resource.private.get_my_entity_taxonomy import GetMyEntityTaxonomy
from resource.private.get_my_form_answers import GetMyFormAnswers
from resource.private.get_my_notifications import GetMyNotifications
from resource.private.get_my_requests import GetMyRequests
from resource.private.get_my_user import GetMyUser
from resource.private.is_logged import IsLogged
from resource.private.update_my_article import UpdateMyArticle
from resource.private.update_my_article_content import UpdateMyArticleContent
from resource.private.update_my_form_answer import UpdateMyFormAnswer
from resource.private.update_my_user import UpdateMyUser
from resource.public.get_public_article_content import GetPublicArticleContent
from resource.public.get_public_article_enums import GetArticleEnums
from resource.public.get_public_article import GetPublicArticle
from resource.public.get_public_articles import GetPublicArticles
from resource.public.get_public_related_articles import GetPublicRelatedArticles
from resource.public.get_public_analytics import GetPublicAnalytics
from resource.public.get_public_entities import GetPublicEntities
from resource.public.get_public_entity_addresses import GetPublicEntityAddresses
from resource.public.get_public_entity_enums import GetPublicEntityEnums
from resource.public.get_public_entity_geolocations import GetPublicEntityGeolocations
from resource.public.get_public_entity_relationship_types import GetPublicEntityRelationshipTypes
from resource.public.get_public_entity_relationships import GetPublicEntityRelationships
from resource.public.get_public_entity import GetPublicEntity
from resource.public.get_public_document import GetPublicDocument
from resource.public.get_public_documents import GetPublicDocuments
from resource.public.get_public_image import GetPublicImage
from resource.public.get_public_node_information import GetPublicNodeInformation
from resource.public.get_public_settings import GetPublicSettings
from resource.public.get_public_taxonomy_values import GetPublicTaxonomyValues
from resource.public.get_public_taxonomy import GetPublicTaxonomy
from resource.public.get_public_vcard import GetPublicVcard
from resource.relationship.add_relationship import AddRelationship
from resource.relationship.add_relationship_type import AddRelationshipType
from resource.relationship.delete_relationship import DeleteRelationship
from resource.relationship.delete_relationship_type import DeleteRelationshipType
from resource.relationship.update_relationship import UpdateRelationship
from resource.relationship.update_relationship_type import UpdateRelationshipType
from resource.request.get_requests import GetRequests
from resource.request.get_request_enums import GetRequestEnums
from resource.request.update_request import UpdateRequest
from resource.resource.get_resources import GetResources
from resource.rss.add_rss_feed import AddRssFeed
from resource.rss.delete_rss_feed import DeleteRssFeed
from resource.rss.get_rss_feeds import GetRssFeeds
from resource.rss.update_rss_feed import UpdateRssFeed
from resource.setting.add_setting import AddSetting
from resource.setting.delete_setting import DeleteSetting
from resource.setting.upload_favicon import UploadFavicon
from resource.setting.upload_logo import UploadLogo
from resource.user.add_user import AddUser
from resource.user.add_user_entity import AddUserEntity
from resource.user.add_user_group import AddUserGroup
from resource.user.add_user_group_right import AddUserGroupRight
from resource.user.delete_user import DeleteUser
from resource.user.delete_user_entity import DeleteUserEntity
from resource.user.delete_user_group import DeleteUserGroup
from resource.user.delete_user_group_right import DeleteUserGroupRight
from resource.user.get_users import GetUsers
from resource.user.get_user import GetUser
from resource.user.get_user_entities import GetUserEntities
from resource.user.get_user_entity_assignments import GetUserEntityAssignments
from resource.user.get_user_entity_enums import GetUserEntityEnums
from resource.user.get_user_group_rights import GetUserGroupRights
from resource.user.get_user_groups import GetUserGroups
from resource.user.get_user_group import GetUserGroup
from resource.user.get_user_group_assignments import GetUserGroupAssignments
from resource.user.update_user import UpdateUser
from resource.user.update_user_entity import UpdateUserEntity
from resource.user.update_user_group_assignment import UpdateUserGroupAssignment
from resource.taxonomy.add_taxonomy_assignment import AddTaxonomyAssignment
from resource.taxonomy.add_taxonomy_category import AddTaxonomyCategory
from resource.taxonomy.add_taxonomy_category_hierarchy import AddTaxonomyCategoryHierarchy
from resource.taxonomy.add_taxonomy_value import AddTaxonomyValue
from resource.taxonomy.add_taxonomy_value_hierarchy import AddTaxonomyValueHierarchy
from resource.taxonomy.delete_taxonomy_assignment import DeleteTaxonomyAssignment
from resource.taxonomy.delete_taxonomy_category import DeleteTaxonomyCategory
from resource.taxonomy.delete_taxonomy_category_hierarchy import DeleteTaxonomyCategoryHierarchy
from resource.taxonomy.delete_taxonomy_value import DeleteTaxonomyValue
from resource.taxonomy.delete_taxonomy_value_hierarchy import DeleteTaxonomyValueHierarchy
from resource.taxonomy.get_taxonomy_categories import GetTaxonomyCategories
from resource.taxonomy.get_taxonomy_category_hierarchy import GetTaxonomyCategoryHierarchy
from resource.taxonomy.get_taxonomy_values import GetTaxonomyValues
from resource.taxonomy.get_taxonomy_value_hierarchy import GetTaxonomyValueHierarchy
from resource.taxonomy.update_taxonomy_category import UpdateTaxonomyCategory
from resource.workforce.add_workforce import AddWorkforce
from resource.workforce.delete_workforce import DeleteWorkforce
import inspect
import sys


def set_routes(*args):

    plugins = args[0]

    for res in inspect.getmembers(sys.modules[__name__], inspect.isclass):

        # Build the endpoint

        endpoint = res[1].__module__.replace("resource.", ".", 1).replace(".", "/")

        functions = inspect.getmembers(res[1], predicate=inspect.isfunction)
        http_functions = [f for n, f in functions if n in ["get", "post", "delete", "put"]]

        if len(http_functions) == 0:
            raise Exception(f"No http function found on resource {res[1].__module__}")
        if len(http_functions) > 1:
            raise Exception(f"Too much http functions found on resource {res[1].__module__}")

        function_args = [a for a in inspect.signature(http_functions[0]).parameters if a != "self" and a != "kwargs"]

        if len(function_args) > 1:
            raise Exception(f"Too much args for http function on resource {res[1].__module__}")

        if len(function_args) == 1:
            endpoint += f"/<{function_args[0]}>"

        # Build the args

        class_args = {a: plugins[a] for a in inspect.getfullargspec(res[1]).args if a != "self"}

        # Add the resource

        plugins["api"].add_resource(res[1], endpoint, resource_class_kwargs=class_args)

        # Add the resource in the doc

        plugins["docs"].register(res[1], resource_class_kwargs=class_args)
