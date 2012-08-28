package org.purang.blog.domain

import net.liftweb.json._
import net.liftweb.json.JsonAST.{JString, JValue}
import net.liftweb.json.Serialization.{write, writePretty}
import java.util

object Serialization {
  implicit val formats = net.liftweb.json.Serialization.formats(NoTypeHints) + UUIDSerializer + BlogStateSerializer
}

object BlogEntryJsonSerializer extends Function1[BlogEntry, String] {

  import Serialization.formats

  implicit def apply(blogEntry: BlogEntry): String = write(blogEntry)

  implicit def unapply(json: String): BlogEntry = parse(json).extract[BlogEntry]
}

object ListBlogEntryJsonSerializer extends Function1[List[BlogEntry], String] {

  import Serialization.formats

  implicit def apply(blogEntry: List[BlogEntry]): String = write(blogEntry)

  implicit def unapply(json: String): List[BlogEntry] = parse(json).extract[List[BlogEntry]]
}

object PrettyBlogEntryJsonSerializer extends Function1[BlogEntry, String] {

  import Serialization.formats

  implicit def apply(blogEntry: BlogEntry): String = writePretty(blogEntry)

  implicit def unapply(json: String): BlogEntry = parse(json).extract[BlogEntry]
}

object BlogEntryJsonDeserializer extends Function1[String, BlogEntry] {

  import Serialization.formats

  implicit def apply(json: String): BlogEntry = parse(json).extract[BlogEntry]

  implicit def unapply(blogEntry: BlogEntry): String = write(blogEntry)
}

object NascentBlogEntryJsonSerializer extends Function1[NascentBlogEntry, String] {

  import Serialization.formats

  implicit def apply(nbe: NascentBlogEntry): String = write(nbe)

  implicit def unapply(json: String): NascentBlogEntry = parse(json).extract[NascentBlogEntry]
}

object NascentBlogEntryJsonDeserializer extends Function1[String, NascentBlogEntry] {

  import Serialization.formats

  implicit def apply(json: String): NascentBlogEntry = parse(json).extract[NascentBlogEntry]

  implicit def unapply(nascentBlogEntry: NascentBlogEntry): String = write(nascentBlogEntry)
}

object NascentCommentJsonDeserializer extends Function1[String, NascentComment] {

  import Serialization.formats

  implicit def apply(json: String): NascentComment = parse(json).extract[NascentComment]

  implicit def unapply(nascentComment: NascentComment): String = write(nascentComment)
}


object BlogStateSerializer extends Serializer[BlogEntryState] {
  private val BlogStateClass = classOf[BlogEntryState]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), BlogEntryState] = {
    case (TypeInfo(BlogStateClass, _), json) => json match {
      case JString(x) =>
        x match {
          case "Nascent" => Nascent
          case "Draft" => Draft
          case "Published" => Published
          case "Retired" => Retired
          case _ => throw new MappingException("Can't convert " + x + " to state")
        }
      case x => throw new MappingException("Can't convert " + x + " to state")
    }
  }

  def serialize(implicit format: Formats): PartialFunction[Any, JValue] = {
    case x: BlogEntryState => JString(x.toString)
  }
}

object UUIDSerializer extends Serializer[util.UUID] {
  private val UUIDClass = classOf[util.UUID]


  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), util.UUID] = {
    case (TypeInfo(UUIDClass, _), json) => json match {
      case JString(x) => util.UUID.fromString(x)
      case x => throw new MappingException("Can't convert " + x + " to UUID")
    }
  }

  def serialize(implicit format: Formats): PartialFunction[Any, JValue] = {
    case x: util.UUID => JString(x.toString)
  }
}
