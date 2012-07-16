package org.purang.blog.domain

import org.scalatest.FunSuite
import org.scalatest.matchers.ShouldMatchers
import tools.nsc.doc.model.comment.Summary

class SerializationDesrializationTest extends FunSuite with ShouldMatchers {

  import Fixtures._

  test("should allow deserializing some blog-entry json") {
    val blogEntry: BlogEntry = BlogEntryJsonDeserializer(json)
    val section: Section = blogEntry.content.sections(1)
    section.headline should be(Some(Headline("The need")))
  }

  test("should allow serializing some blog entry") {
    //use a lot of magic :) implicits and type
    import BlogEntryJsonSerializer._
    println(entry: String)
    (entry: String) should include( """"created":{"time":35255716153154}""")
  }
}

object Fixtures {
  def json = {
    """
      |{
      |    "uid" : "First-_star_blog-pos_faf2acc0-c5b3-4443-94e5-9a8ee64d587b"
      |    "title":"First *blog post* ever",
      |    "state":"Nascent",
      |    "created":{
      |        "time":35255716153154
      |    },
      |    "title":{
      |            "headline":"Finally, first *blog post* ever"
      |        },
      |    "headline":{
      |            "headline":"First *blog post* ever"
      |        },
      |    "content":{
      |        "sections":[
      |            {
      |                "text":
      |                    {
      |                        "content":"It would have been so easy -- just pick a blogging platform and\n voila one has a blog with a lot of functionality. In case you really want to own it just roll out one of the many blogging suites on your server. But **none** can boast of the pain and joy creating your own software\n        brings with it. The creativity, the decision making, the struggles to implement the vision at the micro and macro level,\n        and other nitty gritties spice up the adventure."
      |                    }
      |            },
      |            {
      |                "headline":{
      |                    "headline":"The need"
      |                },
      |                "text":
      |                    {
      |                        "content":"<p class =\"bla\">[Twitter](http://twitter.com) is too terse;\n most journals have more ads then real content;\n a private diary isn't social enough.</p><p>A good blog is about content, content and content.\n A great or unique writing style makes the difference when content is not a problem.\n        All other things equal a great design and technological schnickschnack give the blog that aura of invincibility.</p>"
      |                    }
      |        }
      |    ]
      |},"tags":[
      |    {
      |        "tag":"blog"
      |    },
      |    {
      |        "tag":"writing"
      |    }
      |]}
      |
    """.stripMargin
  }

  val entry = BlogEntry(
    HintedUUIDUniqueIdGenerator("First *blog post* ever"),
    Nascent,
    Created(35255716153154l),
    None,
    Some(Headline("Finally, First *blog post* ever")),
    Headline("First *blog post* ever"),
    Some(Text("This journey took a long time. It almost never started and then it had many close calls. This post narrates this story.")),
    Content(
      List(
        Section(
          None,
          Text("""It would have been so easy -- just pick a blogging platform and \n voila one has a blog with a lot of functionality. In case you really want to own it just roll out one of the many blogging suites on your server. But **none** can boast of the pain and joy creating your own software \n brings with it. The creativity, the decision making, the struggles to implement the vision at the micro and macro level, \n and other nitty gritties spice up the adventure.""")
        ),
        Section(
          Some(Headline("The need")),
          Text("""<p class="bla">[Twitter](http://twitter.com) is too terse; \n most journals have more ads then real content; \n a private diary isn't social enough.</p><p>A good blog is about content, content and content. \n A great or unique writing style makes the difference when content is not a problem. \n All other things equal a great design and technological schnickschnack give the blog that aura of invincibility.</p>""")
        )
      )
    ),
    List(Tag("blog"), Tag("writing")),
    Some(InitialLike),
    List(
      Comment(User("@agreeable"), "totally agree", Created(), Option(InitialLike), Nil),
      Comment(User("@disagreeable"), "totally disagree", Created(), Option(InitialDisLike), Nil)
    )
  )
}
