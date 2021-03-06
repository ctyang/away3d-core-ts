///<reference path="../../_definitions.ts"/>

module away.animators
{
	import IRenderable						= away.base.IRenderable;
	import Camera3D							= away.cameras.Camera3D;
	import Context3DVertexBufferFormat		= away.display3D.Context3DVertexBufferFormat;
	import Matrix3D							= away.geom.Matrix3D;
	import Orientation3D					= away.geom.Orientation3D;
	import Vector3D							= away.geom.Vector3D;
	import Stage3DProxy						= away.managers.Stage3DProxy;
	import MathConsts						= away.math.MathConsts;
	
	/**
	 * ...
	 */
	export class ParticleBillboardState extends ParticleStateBase
	{
		private _matrix:Matrix3D = new Matrix3D;

		private _billboardAxis:Vector3D;
		
		/**
		 *
		 */
		constructor(animator:ParticleAnimator, particleNode:ParticleBillboardNode)
		{
			super(animator, particleNode);

			this._billboardAxis = particleNode._iBillboardAxis;
		}
		
		public setRenderState(stage3DProxy:Stage3DProxy, renderable:IRenderable, animationSubGeometry:AnimationSubGeometry, animationRegisterCache:AnimationRegisterCache, camera:Camera3D)
		{
			var comps:Array<Vector3D>;
			if (this._billboardAxis) {
				var pos:Vector3D = renderable.sceneTransform.position;
				var look:Vector3D = camera.sceneTransform.position.subtract(pos);
				var right:Vector3D = look.crossProduct(this._billboardAxis);
				right.normalize();
				look = this.billboardAxis.crossProduct(right);
				look.normalize();
				
				//create a quick inverse projection matrix
				this._matrix.copyFrom(renderable.sceneTransform);
				comps = this._matrix.decompose(Orientation3D.AXIS_ANGLE);
				this._matrix.copyColumnFrom(0, right);
				this._matrix.copyColumnFrom(1, this.billboardAxis);
				this._matrix.copyColumnFrom(2, look);
				this._matrix.copyColumnFrom(3, pos);
				this._matrix.appendRotation(-comps[1].w*MathConsts.RADIANS_TO_DEGREES, comps[1]);
			} else {
				//create a quick inverse projection matrix
				this._matrix.copyFrom(renderable.sceneTransform);
				this._matrix.append(camera.inverseSceneTransform);
				
				//decompose using axis angle rotations
				comps = this._matrix.decompose(Orientation3D.AXIS_ANGLE);
				
				//recreate the matrix with just the rotation data
				this._matrix.identity();
				this._matrix.appendRotation(-comps[1].w*MathConsts.RADIANS_TO_DEGREES, comps[1]);
			}
			
			//set a new matrix transform constant
			animationRegisterCache.setVertexConstFromMatrix(animationRegisterCache.getRegisterIndex(this._pAnimationNode, ParticleBillboardNode.MATRIX_INDEX), this._matrix);
		}
		
		/**
		 * Defines the billboard axis.
		 */
		public get billboardAxis():Vector3D
		{
			return this.billboardAxis;
		}
		
		public set billboardAxis(value:Vector3D)
		{
			this.billboardAxis = value? value.clone() : null;
			if (this.billboardAxis)
				this.billboardAxis.normalize();
		}
	
	}

}
