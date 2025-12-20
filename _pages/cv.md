---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

Education
======
* **Ph.D. in Mechatronic Engineering**, Shenyang Institute of Automation, CAS, 2023
  * *Dissertation: "Design and Optimization Methods for Autonomous Sailboats Targeting Speed Performance"*
* **Joint Training**, University of Science and Technology of China (USTC), 2015-2016
* **B.Eng.**, Dalian Ocean University, 2014

Work experience
======
* **Engineer**, Institute of Deep-sea Science and Engineering, CAS (2025 - Present)
* **Postdoctoral Researcher**, Tsinghua Shenzhen International Graduate School (2023 - 2025)

Skills
======
* **Research Interests**: Autonomous Sailboats, Marine Robotics, Design Optimization
* **Programming**: Python, C++, MATLAB
* **Tools**: ROS, SolidWorks, Latex
* **Languages**: Chinese (Native), English (Fluent)

Publications
======
  <ul>{% for post in site.publications reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>
  
Talks
======
  <ul>{% for post in site.talks reversed %}
    {% include archive-single-talk-cv.html  %}
  {% endfor %}</ul>
  
Teaching
======
  <ul>{% for post in site.teaching reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>
  
Service and leadership
======
* Reviewer for Ocean Engineering, IEEE JOE
