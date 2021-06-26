<%@ page language="java" contentType="application/json" pageEncoding="UTF-8"%>
<%@ page import="java.util.*, java.io.*" %>
<%@ page import="org.json.*" %>
<%@ page import="java.sql.*" %>

<%!
String getPostData(InputStream in, int size, String charset) {
    if (in != null && size > 0) {
        byte[] buf = new byte[size];
        try{
            in.read(buf);
            if  (charset == null || charset.length() == 0) {
                return new String(buf);
            } else {
                return new String(buf,charset);
            }
        } catch (IOException e){
            e.printStackTrace();
        }
    }
    return null;
}
%>

<%
String msg = "";
int code = 0;
if (request.getMethod().equalsIgnoreCase("post")) {
    //获得请求体
    String postbody = getPostData(request.getInputStream(), request.getContentLength(), null);
    JSONObject postData = new JSONObject(postbody);

    //session.setAttribute("id","1");

    //long timeStamp = 1624340576;
    //int loadedNum = 0;
    //int requestNum = 1;

    long timeStamp = (long)postData.get("timeStamp");
    int loadedNum = (int)postData.get("loadedNum");
    int requestNum = (int)postData.get("requestNum");
    String currentUserId = (String)session.getAttribute("id");

    //连接数据库
    String connectString = "jdbc:mysql://localhost:3306/wwb?autoReconnect=true" + 
        "&useUnicode=true&characterEncoding=UTF-8";
    //String connectString = "jdbc:mysql://localhost:3306/wwb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";
    List<JSONObject> jsonArray = new ArrayList<>();
    try {
        Class.forName("com.mysql.jdbc.Driver");
        //Class.forName("com.mysql.cj.jdbc.Driver");
        Connection conn = DriverManager.getConnection(connectString, "user", "123");
        PreparedStatement stmt = conn.prepareStatement("select * from Users where ID like ?");
        stmt.setString(1, currentUserId);
        
        //判断用户是否存在
        ResultSet rs = stmt.executeQuery();
        if (!rs.next()) {
            code = 1001;
            msg = "The user does not exist！";
        } else {

            stmt = conn.prepareStatement("select * from Likes as a left join postings as b on a.postId = b.ID where b.userId=? and a.createTime<? order by a.createTime limit ? offset ?");
            stmt.setString(1, currentUserId);
            stmt.setLong(2,timeStamp);
            stmt.setInt(3,requestNum);
            stmt.setInt(4,loadedNum);
        
            rs = stmt.executeQuery();
            
            while(rs.next()) {
                String userId = rs.getString("b.userId");
                String postId = rs.getString("b.ID");
                long likeDate = rs.getLong("a.createTime");
                long postDate = rs.getLong("b.createTime");
                String content = rs.getString("b.contents");
                String imgUrl = rs.getString("b.image");
                //-----------------------------------------------
                //查询发帖用户个人信息
                stmt = conn.prepareStatement("select * from Users where ID=?");
                stmt.setString(1,userId);

                ResultSet userInfo = stmt.executeQuery();
                String userName = "";
                String userImgUrl = "";
                if (userInfo.next()) {
                    userName = userInfo.getString("name");
                    userImgUrl = userInfo.getString("avatar");
                } else {
                    code = -1;
                    msg = "fail to get the postings info";
                }

                JSONObject user = new JSONObject();
                user.put("userName",userName);
                user.put("userId",userId);
                user.put("userImgUrl",userImgUrl);

                JSONObject post = new JSONObject();
                post.put("user",user);
                post.put("postId",postId);
                post.put("likeDate",likeDate);
                post.put("postDate",postDate);
                post.put("content",content);
                post.put("imgUrl",imgUrl);

                jsonArray.add(post); 
            }
            
        }
        
        rs.close();
        stmt.close();
        conn.close();
    } catch (Exception e) {
        code = -1;
        msg = e.getMessage();
    }

    JSONObject retval = new JSONObject();
    retval.put("code",code);
    retval.put("msg",msg);
    JSONObject data = new JSONObject();
    data.put("posts",jsonArray);
    retval.put("data",data);
    out.print(retval.toString());
//}

%>