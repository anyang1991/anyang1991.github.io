---
title: "High-fidelity process plant modeling of an unmanned sailboat with a wing sail based on multi-body dynamics"
collection: publications
category: conferences
permalink: /publication/2025-high-fidelity-modeling
excerpt: '本文提出首个面向翼帆无人帆船的高保真 MATLAB/Simulink 过程对象（process plant）模型，将多体动力学与基于 CFD 的气/水动力建模相融合，并通过静态与动态试验完成验证。<br />This paper presents the first high-fidelity MATLAB/Simulink process plant model for wing-sail unmanned sailboats, integrating multi-body dynamics with CFD-informed aerodynamics/hydrodynamics and validating it through static-dynamic tests.'
date: 2025-05-01
venue: 'IFAC Conference on Control Applications in Marine Systems, Robotics, and Vehicles'
paperurl: '/files/IFAC-CAMS-2025-1.pdf'
citation: 'B. Peng, <b>Y. An</b>, M. Zhang, and Z. Ren<sup>*</sup>. (2025). &quot;High-fidelity process plant modeling of an unmanned sailboat with a wing sail based on multi-body dynamics.&quot; <i>IFAC-PapersOnLine</i>.'
---
本文在 MATLAB/Simulink 中构建了翼帆无人帆船的高保真过程对象模型。该 6 自由度多体动力学框架融合了频域水动力（WAMIT）、基于 Morison 方程的流体载荷建模（结合预计算 CFD 系数），以及离散面元方法用于分布式翼面受力计算。通过静态翼帆/舵力标定与动态波浪响应分析进行验证后，该模块化模型可实现刚体动力学与环境载荷的双向耦合，为真实海况下的设计优化与控制算法验证提供物理一致、可复用的高保真仿真工具。

This study develops a pioneering high-fidelity process plant model for unmanned sailboats with wing sails, implemented in MATLAB/Simulink. The 6-DoF multi-body dynamics framework incorporates frequency-domain hydrodynamics (via WAMIT), Morison equation-based fluid load modeling with precomputed CFD coefficients, and discretized panel methods for distributed foil forces. Validated through static sail/rudder force characterization and dynamic wave-response analysis, the modular model enables bidirectional coupling between rigid-body dynamics and environmental forces, providing a physically consistent tool for design optimization and control validation in realistic marine conditions.

<small>[View on Publisher Site (DOI)](https://doi.org/10.1016/j.ifacol.2025.11.687)</small>
